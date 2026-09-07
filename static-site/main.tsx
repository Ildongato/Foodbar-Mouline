import { hydrateRoot } from 'react-dom/client';
import Mouline from '@/components/mouline';
import '@/app/globals.css';

hydrateRoot(document.getElementById('root')!, <Mouline />);
