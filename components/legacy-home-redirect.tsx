'use client';
import { useEffect } from 'react';
import { assetPath } from '@/lib/hosting';

/** Old design URLs all resolve to the one approved homepage. */
export default function LegacyHomeRedirect() {
  useEffect(() => {
    window.location.replace(
      assetPath('/') + window.location.search + window.location.hash,
    );
  }, []);
  return <a href={assetPath('/')}>Open Foodbar Mouline</a>;
}
