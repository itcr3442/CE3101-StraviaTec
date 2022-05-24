import { TestBed } from '@angular/core/testing';

import { ForbiddenHandlerInterceptor } from './forbidden-handler.interceptor';

describe('ForbiddenHandlerInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      ForbiddenHandlerInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: ForbiddenHandlerInterceptor = TestBed.inject(ForbiddenHandlerInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
