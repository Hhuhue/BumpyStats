import { TestBed } from '@angular/core/testing';

import { BumpyballService } from './bumpyball.service';

describe('BumpyballService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BumpyballService = TestBed.get(BumpyballService);
    expect(service).toBeTruthy();
  });
});
