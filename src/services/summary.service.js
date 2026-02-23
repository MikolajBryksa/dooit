import i18n from '@/i18next';
import {getSettingValue} from './settings.service.js';
import {
  supabase,
  getSupabaseUserId,
  initializeAnonymousAuth,
} from './supabase.service.js';
import Config from 'react-native-config';
import realm from '@/storage/schemas';
import Realm from 'realm';
import {logError, flushErrorQueue} from './errors.service.js';
import {stripMarkdown} from '@/utils';

export const getDailySummary = date => {
  const summary = realm.objectForPrimaryKey('DailySummary', date);
  return summary;
};

export const generateAiSummary = async (
  mode,
  bestHabit = null,
  worstHabit = null,
  maxRetries = 3,
) => {
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

  const bestName = String(bestHabit?.habitName || '').trim();
  const worstName = String(worstHabit?.habitName || '').trim();

  let prompt;
  if (mode === 'no-data') {
    prompt = `Hi, my name is ${userName}. Reply to me in ${language}. I am building habits. I have no past data yet. Encourage me to start today with a very small step and suggest one practical tip to make it easy.`;
  } else if (mode === 'stable') {
    prompt = `Hi, my name is ${userName}. Reply to me in ${language}. I am building habits. My results are stable today (no clear improvement or decrease). Give me a short motivational recap and one practical tip to stay consistent tomorrow.`;
  } else if (mode === 'improved' && bestHabit) {
    prompt = `Hi, my name is ${userName}. Reply to me in ${language}. I am building habits. Praise me for improving the most today in "${bestName}". Give one short practical tip to keep improving and stay consistent.`;
  } else if (mode === 'complex' && bestHabit && worstHabit) {
    prompt = `Hi, my name is ${userName}. Reply to me in ${language}. I am building habits. Praise me for the habit that improved the most today: "${bestName}". Give one short practical tip to improve the habit that decreased the most today: "${worstName}". Motivate me to continue.`;
  }

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
    await initializeAnonymousAuth();
    const supabaseUserId = await getSupabaseUserId();

    if (!supabaseUserId) {
      await logError(
        new Error('No Supabase user ID - cannot sync to cloud'),
        'saveSummary.noUserId',
      );
      return;
    }

    const userName = getSettingValue('userName') || 'Anonymous';

    await flushErrorQueue();

    const dataToSave = {
      user_id: supabaseUserId,
      user_name: userName,
      updated_at: new Date().toISOString(),
      habits_json: habits,
      ai_summary: aiSummary || null,
    };

    const {error} = await supabase.from('users').upsert(dataToSave, {
      onConflict: 'user_id',
    });

    if (error) {
      logError(error, 'saveSummary.users');
      return;
    }
  } catch (error) {
    logError(error, 'saveSummary');
  }
};
