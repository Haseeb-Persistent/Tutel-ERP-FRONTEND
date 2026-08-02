// model/menu.model.ts
export interface Menu {
  menuId: number;
  parentMenuId?: number | null;
  menuName: string;
  icon: string;
  route: string;
  displayOrder: number;
  isActive: boolean;
  children?: Menu[];
  expanded?: boolean;
}