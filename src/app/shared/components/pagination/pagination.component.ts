import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Pager {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  pages: number[];
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() pageSize: number = 10;
  @Input() pageNumber: number = 1;
  @Input() totalRecords: number = 0;
  @Output() pageChange = new EventEmitter<{ pageNumber: number; pageSize: number }>();
  @Output() pageSizeChange = new EventEmitter<{ pageNumber: number; pageSize: number }>();

  pager: Pager | null = null;

  ngOnInit() {
    this.updatePager();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalRecords'] || changes['pageNumber'] || changes['pageSize']) {
      this.updatePager();
    }
  }

  updatePager() {
    if (!this.totalRecords || !this.pageSize || !this.pageNumber) {
      this.pager = null;
      return;
    }
    this.pager = this.paginate(this.totalRecords, this.pageNumber, this.pageSize);
  }

  // Handle both number and string from input events
  setPage(page: number | string) {
    let pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    
    if (isNaN(pageNum)) return;
    
    // Ensure valid range
    if (this.pager) {
      if (pageNum < 1) pageNum = 1;
      if (pageNum > this.pager.totalPages) pageNum = this.pager.totalPages;
    }

    if (pageNum < 1 || (this.pager && pageNum > this.pager.totalPages)) {
      return;
    }
    this.pageChange.emit({ pageNumber: pageNum, pageSize: this.pageSize });
  }

  setPageSize(size: number) {
    const newSize = +size;
    this.pageSizeChange.emit({ 
      pageNumber: 1, 
      pageSize: newSize 
    });
  }

  private paginate(totalItems: number, currentPage: number, pageSize: number): Pager {
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPageSafe = Math.min(Math.max(currentPage, 1), totalPages || 1);
    
    const startIndex = (currentPageSafe - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    return {
      totalItems,
      currentPage: currentPageSafe,
      pageSize,
      totalPages: totalPages || 1,
      startIndex,
      endIndex,
      pages: Array.from({ length: totalPages || 1 }, (_, i) => i + 1),
    };
  }
}