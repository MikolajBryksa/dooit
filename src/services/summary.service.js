import {getSettingValue} from './settings.service.js';
import {
  supabase,
  getSupabaseUserId,
  initializeAnonymousAuth,
} from './supabase.service.js';
import {logError, flushErrorQueue} from './errors.service.js';
import {pickRandomMessage} from '@/utils';

export const generateTemplateSummary = (t, bestHabit, worstHabit) => {
  const userName = getSettingValue('userName') || '';
  const bestHabitName = String(bestHabit?.habitName || '').trim();
  const worstHabitName = String(worstHabit?.habitName || '').trim();

  const intro = pickRandomMessage(t, 'intro').replace('{{userName}}', userName);

  const middle = pickRandomMessage(t, 'praise').replace(
    '{{bestHabit}}',
    bestHabitName,
  );

  const parts = [intro, middle];

  if (worstHabit) {
    parts.push(
      pickRandomMessage(t, 'tip').replace('{{worstHabit}}', worstHabitName),
    );
  }

  return parts.join('\n\n');
};

export const saveSummary = async habits => {
  if (__DEV__) return;

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

    await flushErrorQueue();

    const {error} = await supabase.from('users').upsert(
      {
        user_id: supabaseUserId,
        updated_at: new Date().toISOString(),
        habits_json: habits,
      },
      {onConflict: 'user_id'},
    );

    if (error) {
      logError(error, 'saveSummary.users');
    }
  } catch (error) {
    logError(error, 'saveSummary');
  }
};
