import {getLocalDateKey} from '@/utils';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {logError} from '@/services/error-tracking.service';
import NetInfo from '@react-native-community/netinfo';
import {selectActiveHabitKey} from '@/services/habits.service';
import {hasExecution} from '@/services/effectiveness.service';

export function useTodayKey() {
  const [todayKey, setTodayKey] = useState(getLocalDateKey());

  useEffect(() => {
    const id = setInterval(() => {
      setTodayKey(prev => {
        const next = getLocalDateKey();
        return next !== prev ? next : prev;
      });
    }, 60000);

    return () => clearInterval(id);
  }, []);

  return todayKey;
}

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return currentTime;
}

export const useNetworkStatus = (enableMonitoring = false) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const state = await NetInfo.fetch();
      const connected =
        state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);
      return connected;
    } catch (error) {
      logError(error, 'checkConnection');
      setIsConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!enableMonitoring) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected =
        state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);
    });

    return () => {
      unsubscribe();
    };
  }, [enableMonitoring]);

  return {
    isConnected,
    checkConnection,
    isChecking,
  };
};

export function useActiveHabit(todayHabits, currentTime) {
  const [activeKey, setActiveKey] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);

  const activeHabit = useMemo(() => {
    return todayHabits.find(habit => habit.key === activeKey) || null;
  }, [todayHabits, activeKey]);

  const isLastHabit = useMemo(() => {
    if (!todayHabits || todayHabits.length === 0 || !activeHabit) return false;

    const today = getLocalDateKey();
    const incomplete = todayHabits.filter(
      habit => !hasExecution(habit.id, today, habit.selectedHour),
    );

    return incomplete.length === 1 && incomplete[0].key === activeHabit.key;
  }, [todayHabits, activeHabit]);

  const activeKeyCandidate = useMemo(
    () => selectActiveHabitKey(todayHabits, currentTime),
    [todayHabits, currentTime],
  );

  useEffect(() => {
    if (todayHabits.length === 0) {
      setActiveKey(null);
      setAllCompleted(false);
      return;
    }

    const activeExists =
      activeKey !== null && todayHabits.some(habit => habit.key === activeKey);

    if (!activeExists) {
      const nextKey = activeKeyCandidate;

      if (nextKey) {
        setActiveKey(nextKey);
        setAllCompleted(false);
      } else {
        setActiveKey(null);
        setAllCompleted(true);
      }
    } else {
      setAllCompleted(false);
    }
  }, [todayHabits, activeKeyCandidate, activeKey]);

  const goToNextHabit = useCallback(() => {
    if (activeKeyCandidate) {
      setActiveKey(activeKeyCandidate);
      setAllCompleted(false);
    } else {
      setActiveKey(null);
      setAllCompleted(true);
    }
  }, [activeKeyCandidate]);

  return {
    activeHabit,
    isLastHabit,
    allCompleted,
    goToNextHabit,
  };
}
