import { renderToString } from 'react-dom/server';
import Mouline from '@/components/mouline';
import MoulineHome2 from '@/components/home2/mouline';
import MoulineHome3 from '@/components/home3/mouline';

export function render(variant = 'home') {
  return renderToString(
    variant === 'home3' ? (
      <MoulineHome3 />
    ) : variant === 'home2' ? (
      <MoulineHome2 />
    ) : (
      <Mouline />
    ),
  );
}
