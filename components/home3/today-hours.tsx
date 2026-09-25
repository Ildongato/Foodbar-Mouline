import { useEffect, useState } from 'react';
import { compactOpeningHours, todayHours } from '@/lib/business';
import CulinaryIcon from './culinary-icon';

export default function TodayHours() {
  const [today, setToday] = useState<ReturnType<typeof todayHours>>();

  useEffect(() => {
    const updateDay = () => setToday(todayHours());
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
