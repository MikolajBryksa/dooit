import i18n from '@/i18next';
import {getSettingValue} from './settings.service.js';
import {supabase} from './supabase.service.js';
import {HINT_GENERATOR_API_URL} from '../../dooit.config.js';

export const generateStats = (habits, weekdayKey) => {
  let totalActions = 0;
  let goodActions = 0;
  let badActions = 0;
  let skipActions = 0;
  let bestHabit = null;
  let worstHabit = null;
  let maxSuccessRate = -1;
  let minSuccessRate = 101;

  const todayHabits = habits.filter(
    habit => habit.available && habit.repeatDays.includes(weekdayKey),
  );

  todayHabits.forEach(habit => {
    const total = habit.goodCounter + habit.badCounter;
    const successRate = ((habit.goodCounter / total) * 100).toFixed(0);

    totalActions += total;
    goodActions += habit.goodCounter;
    badActions += habit.badCounter;
    skipActions += habit.skipCounter;

    if (successRate > maxSuccessRate && habit.goodCounter > 0) {
      maxSuccessRate = successRate;
      bestHabit = habit;
    }

    if (successRate < minSuccessRate && habit.badCounter > 0) {
      minSuccessRate = successRate;
      worstHabit = habit;
    }
  });

  const goodRate = ((goodActions / totalActions) * 100).toFixed(0);
  const badRate = ((badActions / totalActions) * 100).toFixed(0);

  return {
    totalActions,
    goodActions,
    badActions,
    skipActions,
    goodRate,
    badRate,
    bestHabit,
    maxSuccessRate,
    worstHabit,
    minSuccessRate,
  };
};

export const generateAiSummary = async stats => {
  const language = getSettingValue('language');
  const userName = getSettingValue('userName');

  let prompt = '';
  if (language === 'pl') {
    prompt += i18n.t('ai.prompt_intro', {
      userName,
      totalActions: stats.totalActions,
    });

    if (stats.bestHabit) {
      prompt += i18n.t('ai.prompt_best_habit', {
        habitName: stats.bestHabit.habitName,
        successRate: stats.maxSuccessRate,
      });
    }

    if (stats.worstHabit) {
      prompt += i18n.t('ai.prompt_worst_habit', {
        habitName: stats.worstHabit.habitName,
        successRate: stats.minSuccessRate,
      });
    }

    prompt += i18n.t('ai.prompt_instructions_pl');
  } else {
    prompt += i18n.t('ai.prompt_intro', {
      userName,
      totalActions: stats.totalActions,
    });

    if (stats.bestHabit) {
      prompt += i18n.t('ai.prompt_best_habit', {
        habitName: stats.bestHabit.habitName,
        successRate: stats.maxSuccessRate,
      });
    }

    if (stats.worstHabit) {
      prompt += i18n.t('ai.prompt_worst_habit', {
        habitName: stats.worstHabit.habitName,
        successRate: stats.minSuccessRate,
      });
    }

    prompt += i18n.t('ai.prompt_instructions_en');
  }

  try {
    const response = await fetch(HINT_GENERATOR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({message: prompt}),
    });

    const data = await response.json();
    const aiResponse =
      data?.reply || data?.message || i18n.t('summary.no_response');

    return aiResponse;
  } catch (error) {
    console.error('AI request error:', error);
    throw error;
  }
};

export const saveSummaryToSupabase = async (stats, aiSummary) => {
  try {
    const userId = getSettingValue('userId');
    const userName = getSettingValue('userName');

    const dataToSave = {
      user_id: userId,
      user_name: userName,
      updated_at: new Date().toISOString(),
      total_actions: stats.totalActions,
      good_actions: stats.goodActions,
      bad_actions: stats.badActions,
      skip_actions: stats.skipActions,
      good_rate: stats.goodRate,
      bad_rate: stats.badRate,
      best_habit_name: stats.bestHabit?.habitName || null,
      best_habit_rate: stats.maxSuccessRate >= 0 ? stats.maxSuccessRate : null,
      worst_habit_name: stats.worstHabit?.habitName || null,
      worst_habit_rate:
        stats.minSuccessRate <= 100 ? stats.minSuccessRate : null,
      ai_summary: aiSummary || null,
    };

    const {error} = await supabase.from('Users').upsert(dataToSave, {
      onConflict: 'user_id',
    });

    if (error) {
      console.error(error);
      return;
    }
  } catch (error) {
    console.error(error);
  }
};
