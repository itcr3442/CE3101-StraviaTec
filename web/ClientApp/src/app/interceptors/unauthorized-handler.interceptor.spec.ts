import { TestBed } from '@angular/core/testing';

import { UnauthorizedHandlerInterceptor } from './unauthorized-handler.interceptor';

describe('UnauthorizedHandlerInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UnauthorizedHandlerInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: UnauthorizedHandlerInterceptor = TestBed.inject(UnauthorizedHandlerInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
