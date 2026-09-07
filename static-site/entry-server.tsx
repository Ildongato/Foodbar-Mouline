import { renderToString } from 'react-dom/server';
import Mouline from '@/components/mouline';

export function render() {
  return renderToString(<Mouline />);
}
