import {getLocalDateKey} from '@/utils';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {logError} from '@/services/error-tracking.service';
import NetInfo from '@react-native-community/netinfo';
import {hasExecution} from '@/services/effectiveness.service';
import {selectActiveHabitKey} from '@/services/habits.service';

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

export function useActiveHabit(todayHabits, todayKey) {
  const [activeKey, setActiveKey] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);

  const activeHabit = useMemo(() => {
    return todayHabits.find(habit => habit.key === activeKey) || null;
  }, [todayHabits, activeKey]);

  const incomplete = useMemo(() => {
    if (!todayHabits || todayHabits.length === 0) return [];
    return todayHabits.filter(
      habit => !hasExecution(habit.id, todayKey, habit.selectedHour),
    );
  }, [todayHabits, todayKey]);

  const isLastHabit = useMemo(() => {
    if (!activeHabit) return false;
    if (incomplete.length === 0) return true;
    return incomplete.length === 1 && incomplete[0].key === activeHabit.key;
  }, [activeHabit, incomplete]);

  const activeKeyCandidate = useMemo(
    () => selectActiveHabitKey(todayHabits, todayKey),
    [todayHabits, todayKey],
  );

  useEffect(() => {
    if (!todayHabits || todayHabits.length === 0) {
      setActiveKey(null);
      setAllCompleted(false);
      return;
    }

    const activeExists =
      activeKey !== null && todayHabits.some(h => h.key === activeKey);

    if (!activeExists) {
      if (activeKeyCandidate) {
        setActiveKey(activeKeyCandidate);
        setAllCompleted(false);
      } else {
        setActiveKey(null);
        setAllCompleted(true);
      }
    } else {
      setAllCompleted(false);
    }
  }, [todayHabits, activeKey, activeKeyCandidate]);

  const goToNextHabit = useCallback(() => {
    if (!todayHabits || todayHabits.length === 0) {
      setActiveKey(null);
      setAllCompleted(true);
      return;
    }

    const fromIndex = activeHabit
      ? todayHabits.findIndex(h => h.key === activeHabit.key)
      : -1;

    const findNextFrom = startIdx => {
      for (let i = startIdx; i < todayHabits.length; i++) {
        const h = todayHabits[i];
        if (!hasExecution(h.id, todayKey, h.selectedHour)) return h.key;
      }
      return null;
    };

    const nextKey = findNextFrom(fromIndex + 1) ?? findNextFrom(0);

    if (nextKey) {
      setActiveKey(nextKey);
      setAllCompleted(false);
    } else {
      setActiveKey(null);
      setAllCompleted(true);
    }
  }, [todayHabits, todayKey, activeHabit]);

  return {
    activeHabit,
    isLastHabit,
    allCompleted,
    goToNextHabit,
  };
}
