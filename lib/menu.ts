import onsite from './data/onsite.json';
import takeaway from './data/takeaway.json';
export type MenuMode = 'onsite' | 'takeaway';
export interface MenuItem {
  name: string;
  price: string | null;
  description?: string;
  source: string;
  sourceName: string;
  sourcePrice: string;
  todo?: string;
}
export interface MenuCategory {
  id: string;
  label: string;
  tagline: string;
  source: string;
  items: MenuItem[];
  extras?: MenuItem[];
}
export const menus: Record<MenuMode, MenuCategory[]> = { onsite, takeaway };
