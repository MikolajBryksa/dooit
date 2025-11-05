import i18n from '@/i18next';
import {getSettingValue} from './settings.service';
import {supabase} from './supabase.service';
import {HINT_GENERATOR_API_URL} from '../../dooit.config.js';

/**
 * Generates AI-powered hints and motivation based on user's habit statistics
 * @param {Object} stats - User's habit statistics
 * @param {number} stats.totalActions - Total number of habit actions performed
 * @param {number} stats.goodActions - Number of good choices made
 * @param {number} stats.badActions - Number of bad choices made
 * @param {number} stats.skipActions - Number of skipped actions
 * @param {string} stats.goodRate - Success rate percentage (good actions)
 * @param {string} stats.badRate - Failure rate percentage (bad actions)
 * @param {Object|null} stats.bestHabit - Best performing habit object
 * @param {number} stats.maxSuccessRate - Success rate of best habit
 * @param {Object|null} stats.worstHabit - Worst performing habit object
 * @param {number} stats.minSuccessRate - Success rate of worst habit
 * @returns {Promise<string>} AI-generated advice and motivation
 */
export const generateAIHints = async stats => {
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

    // Save AI response to database
    try {
      const userId = getSettingValue('userId');
      if (userId) {
        await supabase
          .from('Users')
          .update({
            ai_summary: aiResponse,
          })
          .eq('user_id', userId);
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return aiResponse;
  } catch (error) {
    console.error('AI request error:', error);
    throw error;
  }
};
