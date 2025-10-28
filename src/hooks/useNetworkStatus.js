import {useState, useEffect, useCallback} from 'react';
import NetInfo from '@react-native-community/netinfo';

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
      console.error(error);
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
