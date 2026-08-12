import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuService } from '../../core/services/menu.service';
import { FormsModule } from '@angular/forms';
import { Menu } from '../../core/models/menu.model';

@Component({
  selector: 'app-erp-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './erp-sidebar.component.html',
  styleUrls: ['./erp-sidebar.component.css']
})
export class ErpSidebarComponent implements OnInit {
  menus: Menu[] = [];
  activeMenu: Menu | null = null;
  errorMessage = '';
  loading = true;
  searchKeyword: string = '';

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

  // SEARCH LOGIC
  get filteredMenus(): Menu[] {
    if (!this.searchKeyword || this.searchKeyword.trim() === '') {
      return this.menus;
    }

    const keyword = this.searchKeyword.toLowerCase().trim();
    const result: Menu[] = [];

    const searchRecursive = (menu: Menu): boolean => {
      let isMatch = menu.menuName.toLowerCase().includes(keyword);

      if (menu.children && menu.children.length > 0) {
        const filteredChildren = menu.children.filter(child => searchRecursive(child));
        if (filteredChildren.length > 0) {
          isMatch = true;
          // We create a copy only for VIEW purposes
          const matchedMenu = { ...menu, children: filteredChildren };
          matchedMenu.expanded = true; 
          result.push(matchedMenu);
          return true;
        }
      }

      if (isMatch) {
        const matchedMenu = { ...menu };
        matchedMenu.expanded = true; 
        result.push(matchedMenu);
        return true;
      }
      return false;
    };

    this.menus.forEach(menu => searchRecursive(menu));
    return result;
  }

  // ✅ FIX: Helper to find the original menu object from this.menus
  private findOriginalMenu(menu: Menu): Menu | null {
    const searchOriginal = (menus: Menu[]): Menu | null => {
      for (const m of menus) {
        if (m.menuId === menu.menuId) return m;
        if (m.children && m.children.length > 0) {
          const found = searchOriginal(m.children);
          if (found) return found;
        }
      }
      return null;
    };
    return searchOriginal(this.menus);
  }

  // ✅ FIX: Now works because we toggle the ORIGINAL menu, not the view copy
  toggle(menu: Menu) {
    const originalMenu = this.findOriginalMenu(menu);
    if (originalMenu) {
      originalMenu.expanded = !originalMenu.expanded;
      // Trigger change detection because we mutated the original object
      this.cdr.detectChanges(); 
    } else {
      // Fallback if somehow original isn't found (should rarely happen)
      menu.expanded = !menu.expanded;
    }
  }

  // ✅ FIX: Navigation + Expand works correctly
  goto(menu: Menu) {
    const originalMenu = this.findOriginalMenu(menu);
    const target = originalMenu || menu; // Use original if found

    // If it has children, just toggle it
    if (target.children && target.children.length > 0) {
      target.expanded = !target.expanded;
      this.cdr.detectChanges();
      return;
    }

    // Navigate
    this.activeMenu = target;
    const formName = target.route?.split('/').pop();

    this.router.navigate(
      [`/app/ErpList/${formName}`],  
      {
        queryParams: {
          formTitle: target.menuName,
          formRoute: target.route,
          menuId: target.menuId          
        }
      }
    );
  }

  isActive(menu: Menu): boolean {
    return this.activeMenu?.menuId === menu.menuId;
  }

  isParentMenu(menu: Menu): boolean {
    return !!(menu.children && menu.children.length > 0);
  }
}