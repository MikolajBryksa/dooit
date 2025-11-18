import i18n from '@/i18next';
import {getSettingValue} from './settings.service.js';
import {supabase} from './supabase.service.js';
import Config from 'react-native-config';
import realm from '@/storage/schemas';
import Realm from 'realm';
import {logError} from './error-tracking.service.js';
import {stripMarkdown} from '@/utils.js';

export const getDailySummary = date => {
  const summary = realm.objectForPrimaryKey('DailySummary', date);
  return summary;
};

export const generateAiSummary = async (simplifiedHabits, maxRetries = 3) => {
  const language = getSettingValue('language');
  const userName = getSettingValue('userName');

  const payload = {
    language,
    userName,
    habitsJson: simplifiedHabits,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(Config.HINT_GENERATOR_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: JSON.stringify(payload)}),
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
