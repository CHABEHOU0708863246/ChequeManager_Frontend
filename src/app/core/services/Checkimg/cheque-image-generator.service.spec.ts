import { TestBed } from '@angular/core/testing';

import { ChequeImageGeneratorService } from './cheque-image-generator.service';

describe('ChequeImageGeneratorService', () => {
  let service: ChequeImageGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChequeImageGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
