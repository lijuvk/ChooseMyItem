import menuData from '@/data/menu.json';

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  emoji: string;
};

export function getMenu(): MenuItem[] {
  return menuData.items as MenuItem[];
}
