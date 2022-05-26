import { TestBed } from '@angular/core/testing';

import { NotFoundHandlerInterceptor } from './not-found-handler.interceptor';

describe('NotFoundHandlerInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      NotFoundHandlerInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: NotFoundHandlerInterceptor = TestBed.inject(NotFoundHandlerInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
