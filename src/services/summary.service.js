import i18n from '@/i18next';
import {getSettingValue} from './settings.service.js';
import {supabase, getSupabaseUserId} from './supabase.service.js';
import Config from 'react-native-config';
import realm from '@/storage/schemas';
import Realm from 'realm';
import {logError} from './error-tracking.service.js';
import {stripMarkdown} from '@/utils.js';
import {calculateWeeklyEffectiveness} from './effectiveness.service.js';

function selectBestAndWorstHabits(habits) {
  // Calculate weekly effectiveness for each habit
  const habitsWithEffectiveness = habits
    .map(habit => {
      const stats = calculateWeeklyEffectiveness(habit.id, {
        id: habit.id,
        repeatDays: habit.repeatDays,
        repeatHours: habit.repeatHours,
      });

      // Skip habits with no data or null effectiveness
      if (stats.effectiveness === null || stats.totalExpected === 0) {
        return null;
      }

      return {
        ...habit,
        effectiveness: stats.effectiveness,
      };
    })
    .filter(h => h !== null);

  if (habitsWithEffectiveness.length === 0) return [];

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

export const generateAiSummary = async (habits, maxRetries = 3) => {
  const fallbackNoActions = i18n.t('summary.no-actions');

  if (!habits || habits.length === 0) {
    return fallbackNoActions;
  }

  let language = 'en';
  let userName = 'Friend';

  try {
    const lang = getSettingValue('language');
    if (lang) language = lang;
  } catch (e) {
    await logError(e, 'generateAiSummary.language');
  }

  try {
    const name = getSettingValue('userName');
    if (name) userName = name;
  } catch (e) {
    await logError(e, 'generateAiSummary.userName');
  }

  const selectedHabits = selectBestAndWorstHabits(habits);
  if (!selectedHabits || selectedHabits.length === 0) {
    return fallbackNoActions;
  }

  const bestHabit = selectedHabits[0];
  const worstHabit = selectedHabits.length > 1 ? selectedHabits[1] : null;

  const prompt =
    `You are an AI assistant. Respond in the language: ${language}. Address the user by name: ${userName}.\n` +
    `Praise the user's best habit: ${bestHabit.habitName} with ${bestHabit.effectiveness}% effectiveness. ` +
    `This means the user successfully performed this habit at the expected times, resisting the bad habit: ${bestHabit.habitEnemy}.\n` +
    (worstHabit
      ? `Encourage the user to improve their habit ${worstHabit.habitName}, which has ${worstHabit.effectiveness}% effectiveness. ` +
        `This habit needs more attention to overcome the bad habit: ${worstHabit.habitEnemy}.\n`
      : '') +
    `Encourage the user by name to keep working on their habits.\n`;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(Config.HINT_GENERATOR_API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: prompt}),
      });

      if (!response.ok) {
        throw new Error(
          `AI summary request failed with status ${response.status}`,
        );
      }

      let data = {};
      try {
        data = await response.json();
      } catch (jsonError) {
        await logError(jsonError, 'generateAiSummary.parseJson');
        throw jsonError;
      }

      const rawReply = data?.reply;
      if (!rawReply || typeof rawReply !== 'string') {
        throw new Error('AI did not provide a valid reply');
      }

      return stripMarkdown(rawReply);
    } catch (error) {
      lastError = error;
      await logError(error, 'generateAiSummary.fetch');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  await logError(
    lastError || new Error('AI did not provide a response'),
    'generateAiSummary.maxRetries',
  );
  throw lastError || new Error('AI did not provide a response');
};

export const saveSummary = async (date, habits, aiSummary) => {
  realm.write(() => {
    realm.create(
      'DailySummary',
      {
        updatedAt: date,
        habitsJson: JSON.stringify(habits),
        aiSummary: aiSummary,
      },
      Realm.UpdateMode.Modified,
    );
  });

  try {
    // Get anonymous Supabase user ID (secured by JWT)
    const supabaseUserId = await getSupabaseUserId();

    if (!supabaseUserId) {
      console.warn('[saveSummary] No Supabase user ID - skipping cloud sync');
      return;
    }

    const userName = getSettingValue('userName') || 'Anonymous';

    // Save to Users table
    const dataToSave = {
      user_id: supabaseUserId,
      user_name: userName,
      updated_at: new Date().toISOString(),
      habits_json: habits,
      ai_summary: aiSummary || null,
    };

    // Upsert - update existing or create new
    const {error} = await supabase.from('users').upsert(dataToSave, {
      onConflict: 'user_id',
    });

    if (error) {
      logError(error, 'saveSummary.users');
      return;
    }

    console.log('[saveSummary] Data synced to Supabase users table');
  } catch (error) {
    logError(error, 'saveSummary');
  }
};
