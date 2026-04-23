import {getSettingValue} from './settings.service.js';
import {syncUserData} from './supabase.service.js';
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

export const saveSummary = async (habits, streak) => {
  if (__DEV__) return;

  try {
    await flushErrorQueue();
    await syncUserData(habits, streak);
  } catch (error) {
    logError(error, 'saveSummary');
  }
};
