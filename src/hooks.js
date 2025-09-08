import {useEffect, useState} from 'react';
import {getLocalDateKey} from '@/utils';

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
