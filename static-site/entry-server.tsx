import { renderToString } from 'react-dom/server';
import MoulineHome3 from '@/components/home3/mouline';

export function render() {
  return renderToString(<MoulineHome3 />);
}
