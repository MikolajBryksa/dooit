import {useEffect, useState} from 'react';
import {getTodayKey} from '@/utils';

export function useTodayKey() {
  const [todayKey, setTodayKey] = useState(getTodayKey());

  useEffect(() => {
    const id = setInterval(() => {
      setTodayKey(prev => {
        const next = getTodayKey();
        return next !== prev ? next : prev;
      });
    }, 60000);

    return () => clearInterval(id);
  }, []);

  return todayKey;
}
