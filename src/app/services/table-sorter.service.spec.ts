import { TestBed } from '@angular/core/testing';

import { TableSorterService } from './table-sorter.service';

describe('TableSorterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TableSorterService = TestBed.get(TableSorterService);
    expect(service).toBeTruthy();
  });
});
