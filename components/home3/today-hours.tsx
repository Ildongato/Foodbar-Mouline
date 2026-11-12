import { useEffect, useState } from 'react';
import { compactOpeningHours, todayHours } from '@/lib/business';
import { getTemporaryOpeningHours } from '@/lib/closures';
import CulinaryIcon from './culinary-icon';

export default function TodayHours() {
  const [today, setToday] = useState<{ opens: string | null; display: string }>();

  useEffect(() => {
    const updateDay = () => {
      const now = new Date();
      const hours = todayHours(now);
      const temporaryHours = getTemporaryOpeningHours(now);
      setToday(hours && temporaryHours ? { ...hours, ...temporaryHours } : hours);
    };
    updateDay();
    const timer = setInterval(updateDay, 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="today-hours">
      <CulinaryIcon categoryId="klok" />
      <span>
        {today ? (
          today.opens ? (
            <>
              Vandaag <strong>{today.display}</strong>
            </>
          ) : (
            <strong>Vandaag gesloten</strong>
          )
        ) : (
          compactOpeningHours
        )}
      </span>
    </p>
  );
}
