import {getLocalDateKey} from '@/utils';
import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {BackHandler, Animated, Easing} from 'react-native';
import {logError} from '@/services/errors.service';
import NetInfo from '@react-native-community/netinfo';
import {hasExecutionOrDeleted} from '@/services/executions.service';
import {selectActiveHabitKey} from '@/services/habits.service';

export function useDoubleBackExit(enabled = true) {
  const lastBackPress = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const backAction = () => {
      const now = Date.now();
      if (lastBackPress.current && now - lastBackPress.current < 2000) {
        BackHandler.exitApp();
        return true;
      }
      lastBackPress.current = now;
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [enabled]);
}

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

const CHOICE_EFFECT_PARTICLE_COUNT = 10;
const CHOICE_EFFECT_ANGLES = Array.from(
  {length: CHOICE_EFFECT_PARTICLE_COUNT},
  (_, i) => (i / CHOICE_EFFECT_PARTICLE_COUNT) * 2 * Math.PI,
);

export function useChoiceEffect() {
  const [effectType, setEffectType] = useState(null);

  const cardShakeX = useRef(new Animated.Value(0)).current;
  const cardFlashOpacity = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    CHOICE_EFFECT_ANGLES.map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    if (effectType === null) return;

    particleAnims.forEach(anim => {
      anim.opacity.setValue(effectType === 'done' ? 1 : 0.9);
      anim.scale.setValue(effectType === 'done' ? 0.2 : 1.2);
      anim.translateX.setValue(0);
      anim.translateY.setValue(0);
    });

    cardFlashOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(cardFlashOpacity, {
        toValue: effectType === 'done' ? 0.18 : 0.14,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardFlashOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    const particleAnimations = particleAnims.map((anim, i) => {
      const distance =
        effectType === 'done'
          ? 65 + Math.random() * 45
          : 50 + Math.random() * 30;

      return Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: effectType === 'done' ? 950 : 700,
          easing:
            effectType === 'done'
              ? Easing.out(Easing.cubic)
              : Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: effectType === 'done' ? 1.5 : 0.1,
          duration: effectType === 'done' ? 950 : 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: Math.cos(CHOICE_EFFECT_ANGLES[i]) * distance,
          duration: effectType === 'done' ? 950 : 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: Math.sin(CHOICE_EFFECT_ANGLES[i]) * distance,
          duration: effectType === 'done' ? 950 : 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
    });

    if (effectType === 'skipped') {
      Animated.sequence([
        Animated.timing(cardShakeX, {
          toValue: -10,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(cardShakeX, {
          toValue: 10,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(cardShakeX, {
          toValue: -7,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(cardShakeX, {
          toValue: 7,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(cardShakeX, {
          toValue: -3,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.timing(cardShakeX, {
          toValue: 0,
          duration: 65,
          useNativeDriver: true,
        }),
      ]).start();
    }

    Animated.parallel(particleAnimations).start(() => setEffectType(null));
  }, [effectType, cardFlashOpacity, cardShakeX, particleAnims]);

  const triggerEffect = useCallback(type => {
    setEffectType(type);
  }, []);

  const resetEffect = useCallback(() => {
    setEffectType(null);
    cardShakeX.setValue(0);
    cardFlashOpacity.setValue(0);
    particleAnims.forEach(anim => {
      anim.opacity.setValue(0);
      anim.scale.setValue(0);
      anim.translateX.setValue(0);
      anim.translateY.setValue(0);
    });
  }, [cardShakeX, cardFlashOpacity, particleAnims]);

  return {
    triggerEffect,
    resetEffect,
    effectType,
    cardShakeX,
    cardFlashOpacity,
    particleAnims,
  };
}

export function useActiveHabit(todayHabits, todayKey) {
  const [activeKey, setActiveKey] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);

  const activeHabit = useMemo(() => {
    return todayHabits.find(habit => habit.key === activeKey) || null;
  }, [todayHabits, activeKey]);

  const incomplete = useMemo(() => {
    if (!todayHabits || todayHabits.length === 0) return [];
    return todayHabits.filter(
      habit => !hasExecutionOrDeleted(habit.id, todayKey, habit.slotIndex),
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
    } else if (activeKeyCandidate && activeKeyCandidate !== activeKey) {
      // Current habit still exists but a different candidate appeared.
      // Only auto-switch when the candidate is at an EARLIER hour — this covers
      // adding a new earlier habit or unchecking a past execution.
      // We deliberately don't switch when the candidate is later (e.g. user just
      // marked the current habit done and is seeing the celebration screen).
      const toMinutes = h => {
        if (!h) return Infinity;
        const [hrs, mins] = h.split(':').map(Number);
        return hrs * 60 + (mins || 0);
      };
      const currentHabit = todayHabits.find(h => h.key === activeKey);
      const candidateHabit = todayHabits.find(
        h => h.key === activeKeyCandidate,
      );
      if (
        currentHabit &&
        candidateHabit &&
        toMinutes(candidateHabit.selectedHour) <
          toMinutes(currentHabit.selectedHour)
      ) {
        setActiveKey(activeKeyCandidate);
      }
      setAllCompleted(false);
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
        if (!hasExecutionOrDeleted(h.id, todayKey, h.slotIndex)) return h.key;
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
