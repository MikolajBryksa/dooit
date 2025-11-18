import {getLocalDateKey} from '@/utils';
import {useState, useEffect, useCallback} from 'react';
import {logError} from '@/services/error-tracking.service';
import NetInfo from '@react-native-community/netinfo';

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
