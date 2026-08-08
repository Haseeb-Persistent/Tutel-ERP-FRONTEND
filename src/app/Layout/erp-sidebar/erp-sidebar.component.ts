import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { FormsModule } from '@angular/forms';
import { Menu } from '../../core/models/menu.model';

@Component({
  selector: 'app-erp-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
],
  templateUrl: './erp-sidebar.component.html',
  styleUrls: ['./erp-sidebar.component.css']
})
export class ErpSidebarComponent implements OnInit {
  menus: Menu[] = [];
  activeMenu: Menu | null = null;
  errorMessage = '';
  loading = true;

  constructor(
    private MenuService: MenuService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus() {
    this.loading = true;
    this.MenuService.getMenus().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.menus = res;
        } else if (res && res.data && Array.isArray(res.data)) {
          this.menus = res.data;
        } else if (res && res.responseCode !== undefined && res.data) {
          this.menus = res.data;
        } else {
          console.error('Unexpected response format:', res);
          this.errorMessage = 'Unexpected data format from server';
          this.menus = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        this.errorMessage = error.error?.message || 'Failed to load menus';
        this.menus = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
// In erp-sidebar.component.ts
goto(menu: Menu) {

  
  if (menu.children && menu.children.length > 0) {
    menu.expanded = !menu.expanded;
    return;
  }
  this.activeMenu = menu;
  
  // ✅ Navigate to the Dynamic List View (Grid)
  this.router.navigate(
    [`app/ErpList/${menu.menuId}`], // Changed: /app/FrmList/Country
    {
      queryParams: {
        f: menu.menuId,
        formTitle: menu.menuName
      }
    }
  );
}

  toggle(menu: Menu) {
    menu.expanded = !menu.expanded;
  }

  isActive(menu: Menu): boolean {
    return this.activeMenu?.menuId === menu.menuId;
  }

  isParentMenu(menu: Menu): boolean {
    return !!(menu.children && menu.children.length > 0);
  }
}