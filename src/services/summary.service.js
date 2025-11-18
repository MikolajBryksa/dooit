import i18n from '@/i18next';
import {getSettingValue} from './settings.service.js';
import {supabase} from './supabase.service.js';
import Config from 'react-native-config';
import realm from '@/storage/schemas';
import Realm from 'realm';
import {logError} from './error-tracking.service.js';
import {stripMarkdown} from '@/utils.js';

function selectBestAndWorstHabits(habits) {
  // Skip habits never performed (both counters zero)
  const filtered = habits.filter(
    h => !(h.goodCounter === 0 && h.badCounter === 0),
  );
  if (filtered.length === 0) return [];

  // Add effectiveness (percentage) to each habit
  const habitsWithEffectiveness = filtered.map(habit => {
    let effectiveness;
    const total = habit.goodCounter + habit.badCounter;
    if (total === 0) {
      effectiveness = 0;
    } else {
      effectiveness = Math.round((habit.goodCounter / total) * 1000) / 10;
    }
    return {...habit, effectiveness};
  });

  const sorted = habitsWithEffectiveness.sort(
    (a, b) => b.effectiveness - a.effectiveness,
  );

  const bestHabit = sorted[0];
  const worstHabit = sorted[sorted.length - 1];

  if (bestHabit === worstHabit) {
    return [bestHabit];
  }

  return [bestHabit, worstHabit];
}

export const getDailySummary = date => {
  const summary = realm.objectForPrimaryKey('DailySummary', date);
  return summary;
};

export const generateAiSummary = async (simplifiedHabits, maxRetries = 3) => {
  const language = getSettingValue('language');
  const userName = getSettingValue('userName');
  const selectedHabits = selectBestAndWorstHabits(simplifiedHabits);

  let bestHabit = selectedHabits[0] || null;
  let worstHabit = selectedHabits.length > 1 ? selectedHabits[1] : null;

  let prompt =
    `You are an AI assistant. Respond in the language: ${language}. Address the user by name: ${userName}.\n` +
    `Praise the user's best habit, which is ${bestHabit.habitName} with an effectiveness of ${bestHabit.effectiveness}%. ` +
    `Such effectiveness indicates that the user is successfully resisting the bad habit: ${bestHabit.habitEnemy}. ` +
    `Throughout all days so far, the user has performed this habit ${bestHabit.goodCounter} times and succumbed to the bad habit only ${bestHabit.badCounter} times.\n` +
    (worstHabit
      ? `Emphasize why it is worth developing the habit that is going the worst for the user, which is ${worstHabit.habitName} with an effectiveness of ${worstHabit.effectiveness}%. ` +
        `Such effectiveness indicates that the user is having difficulty overcoming the bad habit: ${worstHabit.habitEnemy}. ` +
        `Throughout all days so far, the user has performed this habit only ${worstHabit.goodCounter} times and succumbed to the bad habit as many as ${worstHabit.badCounter} times.\n`
      : '') +
    `Encourage the user by name to keep working on their habits.\n`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(Config.HINT_GENERATOR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: prompt}),
      });

      const data = await response.json();
      let aiResponse = data?.reply || i18n.t('summary.no_response');

      if (aiResponse !== i18n.t('summary.no_response')) {
        aiResponse = stripMarkdown(aiResponse);
      }

      if (
        attempt === maxRetries &&
        aiResponse === i18n.t('summary.no_response')
      ) {
        logError(
          new Error('AI did not provide a response'),
          'generateAiSummary',
        );
      }

      return aiResponse;
    } catch (error) {
      logError(error, 'generateAiSummary');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};

export const saveSummary = async (date, simplifiedHabits, aiSummary) => {
  realm.write(() => {
    realm.create(
      'DailySummary',
      {
        updatedAt: date,
        habitsJson: JSON.stringify(simplifiedHabits),
        aiSummary: aiSummary,
      },
      Realm.UpdateMode.Modified,
    );
  });

  try {
    const userId = getSettingValue('userId');
    const userName = getSettingValue('userName');

    const dataToSave = {
      user_id: userId,
      user_name: userName,
      updated_at: new Date().toISOString(),
      habits_json: simplifiedHabits,
      ai_summary: aiSummary || null,
    };

    const {error} = await supabase.from('Users').upsert(dataToSave, {
      onConflict: 'user_id',
    });

    if (error) {
      logError(error, 'saveSummary');
      return;
    }
  } catch (error) {
    logError(error, 'saveSummary');
  }
};
