import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
  isUrgent: boolean;
  totalHours: number;
  isValid: boolean;
}

export function useCountdown(deadline: string): CountdownResult {
  const calc = (): CountdownResult => {
    if (!deadline) {
      return { days: 0, hours: 0, minutes: 0, isExpired: false, isUrgent: false, totalHours: 0, isValid: false };
    }
    const now = Date.now();
    const target = new Date(deadline).getTime();
    if (Number.isNaN(target)) {
      return { days: 0, hours: 0, minutes: 0, isExpired: false, isUrgent: false, totalHours: 0, isValid: false };
    }
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isExpired: true, isUrgent: false, totalHours: 0, isValid: true };
    }

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const isUrgent = totalHours <= 72;

    return { days, hours, minutes, isExpired: false, isUrgent, totalHours, isValid: true };
  };

  const [result, setResult] = useState<CountdownResult>(calc);

  useEffect(() => {
    const timer = setInterval(() => {
      setResult(calc());
    }, 60000);
    return () => clearInterval(timer);
  }, [deadline]);

  return result;
}
