import {getSettingValue} from './settings.service.js';
import {
  supabase,
  getSupabaseUserId,
  initializeAnonymousAuth,
} from './supabase.service.js';
import {logError, flushErrorQueue} from './errors.service.js';
import {pickRandomMessage} from '@/utils';

export const generateTemplateSummary = (t, mode, bestHabit, worstHabit) => {
  const userName = getSettingValue('userName') || '';
  const bestName = String(bestHabit?.habitName || '').trim();
  const worstName = String(worstHabit?.habitName || '').trim();

  if (mode === 'no-data') {
    return pickRandomMessage(t, 'no-data').replace('{{userName}}', userName);
  }
  if (mode === 'stable') {
    return pickRandomMessage(t, 'stable')
      .replace('{{userName}}', userName)
      .replace('{{habitName}}', bestName);
  }
  if (mode === 'complex') {
    const praise = pickRandomMessage(t, 'praise')
      .replace('{{userName}}', userName)
      .replace('{{bestHabit}}', bestName);
    const tip = pickRandomMessage(t, 'tip').replace(
      '{{worstHabit}}',
      worstName,
    );
    return `${praise} ${tip}`;
  }
  return '';
};

export const saveSummary = async habits => {
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

    const {error} = await supabase.from('users').upsert(
      {
        user_id: supabaseUserId,
        user_name: userName,
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
