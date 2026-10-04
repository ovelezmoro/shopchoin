import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { apiInterceptor } from '../interceptors/api.interceptor';
import { AuthService } from './auth.service';
import { OrderService } from './order.service';
import { ApiFeedbackService } from './api-feedback.service';
import { CsrfService } from './csrf.service';
import { UserRole } from '../models/shopchain.models';
import { environment } from '../../../environments/environment';

describe('Integración HTTP', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  const base = environment.apiUrl;
  const user = { id: 1, names: 'Admin', email: 'admin@shopchain.pe', role: UserRole.Admin, active: true };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting(),
    ] });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => http.verify());

  it('envía cookies y formulario de login y usa el token renovado al cerrar sesión', () => {
    let loggedIn = false;
    auth.login(user.email, 'admin123').subscribe(() => loggedIn = true);
    const csrf = http.expectOne(`${base}/auth/csrf`);
    expect(csrf.request.withCredentials).toBeTrue();
    csrf.flush({ token: 'before', headerName: 'X-CSRF-TOKEN' });
    const login = http.expectOne(`${base}/auth/login`);
    expect(login.request.method).toBe('POST');
    expect(login.request.body.get('identifier')).toBe(user.email);
    expect(login.request.body.get('password')).toBe('admin123');
    expect(login.request.headers.get('X-CSRF-TOKEN')).toBe('before');
    login.flush(user);
    expect(loggedIn).toBeFalse();
    http.expectOne(`${base}/auth/csrf`).flush({ token: 'after', headerName: 'X-CSRF-TOKEN' });
    expect(loggedIn).toBeTrue();
    expect(auth.currentUser).toEqual(user);
    auth.logout().subscribe();
    const logout = http.expectOne(`${base}/auth/logout`);
    expect(logout.request.headers.get('X-CSRF-TOKEN')).toBe('after');
    logout.flush(null, { status: 204, statusText: 'No Content' });
    expect(auth.currentUser).toBeNull();
  });

  it('recupera el usuario y CSRF al recargar una sesión válida', () => {
    auth.restoreSession().subscribe();
    http.expectOne(`${base}/auth/me`).flush(user);
    http.expectOne(`${base}/auth/csrf`).flush({ token: 'restored', headerName: 'X-CSRF-TOKEN' });
    expect(auth.currentUser).toEqual(user);
    expect(TestBed.inject(CsrfService).token).toBe('restored');
  });

  it('una sesión vencida no autentica al usuario', () => {
    let result: unknown = 'waiting';
    auth.restoreSession().subscribe((value) => result = value);
    http.expectOne(`${base}/auth/me`).flush({ detail: 'Debes iniciar sesión.' }, { status: 401, statusText: 'Unauthorized' });
    expect(result).toBeNull();
    expect(auth.currentUser).toBeNull();
  });

  it('envía solo los datos del pedido y muestra el error de stock sin anunciar éxito', () => {
    const feedback = TestBed.inject(ApiFeedbackService);
    const body = { customer: 'Ana', customerDocument: '12345678', branchId: 2, observations: '', items: [{ productId: 3, quantity: 2, size: 40 }] };
    let saved = false;
    TestBed.inject(OrderService).createOrder(body).subscribe(() => saved = true);
    expect(feedback.pendingWrites()).toBe(1);
    const request = http.expectOne(`${base}/orders`);
    expect(request.request.body).toEqual(body);
    expect(request.request.withCredentials).toBeTrue();
    request.flush({ detail: 'Stock insuficiente.' }, { status: 409, statusText: 'Conflict' });
    expect(saved).toBeFalse();
    expect(feedback.error()).toBe('Stock insuficiente.');
    expect(feedback.pendingWrites()).toBe(0);
  });
});
