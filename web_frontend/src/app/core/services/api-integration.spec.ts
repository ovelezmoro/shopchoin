import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { apiInterceptor } from '../interceptors/api.interceptor';
import { AuthService } from './auth.service';
import { OrderService } from './order.service';
import { ApiFeedbackService } from './api-feedback.service';
import { UserRole } from '../models/shopchain.models';
import { environment } from '../../../environments/environment';

describe('Integración HTTP', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  const base = environment.apiUrl;
  const user = { id: 1, names: 'Admin', email: 'admin@shopchain.pe', role: UserRole.Admin, active: true };

  beforeEach(() => {
    sessionStorage.removeItem('shopchain.accessToken');
    TestBed.configureTestingModule({ providers: [
      provideRouter([]), provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting(),
    ] });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => {
    http.verify();
    sessionStorage.removeItem('shopchain.accessToken');
  });

  it('envía login JSON, guarda el JWT y cierra sesión localmente', () => {
    sessionStorage.setItem('shopchain.accessToken', 'old-token');
    let loggedIn = false;
    auth.login(user.email, 'admin123').subscribe(() => loggedIn = true);
    const login = http.expectOne(`${base}/auth/login`);
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ identifier: user.email, password: 'admin123' });
    expect(login.request.withCredentials).toBeFalse();
    expect(login.request.headers.has('Authorization')).toBeFalse();
    expect(login.request.headers.has('X-CSRF-TOKEN')).toBeFalse();
    login.flush({ accessToken: 'jwt-token', tokenType: 'Bearer', expiresIn: 1800, user });
    expect(loggedIn).toBeTrue();
    expect(auth.currentUser).toEqual(user);
    expect(sessionStorage.getItem('shopchain.accessToken')).toBe('jwt-token');
    auth.logout().subscribe();
    http.expectNone(`${base}/auth/logout`);
    expect(auth.currentUser).toBeNull();
    expect(auth.accessToken).toBeNull();
  });

  it('recupera el usuario con el JWT guardado al recargar', () => {
    sessionStorage.setItem('shopchain.accessToken', 'saved-token');
    auth.restoreSession().subscribe();
    const me = http.expectOne(`${base}/auth/me`);
    expect(me.request.headers.get('Authorization')).toBe('Bearer saved-token');
    me.flush(user);
    expect(auth.currentUser).toEqual(user);
  });

  it('un token vencido se elimina y no autentica al usuario', () => {
    sessionStorage.setItem('shopchain.accessToken', 'expired-token');
    let result: unknown = 'waiting';
    auth.restoreSession().subscribe((value) => result = value);
    http.expectOne(`${base}/auth/me`).flush({ detail: 'Debes iniciar sesión.' }, { status: 401, statusText: 'Unauthorized' });
    expect(result).toBeNull();
    expect(auth.currentUser).toBeNull();
    expect(auth.accessToken).toBeNull();
  });

  it('sin token no intenta recuperar al usuario', () => {
    let result: unknown = 'waiting';
    auth.restoreSession().subscribe((value) => result = value);
    http.expectNone(`${base}/auth/me`);
    expect(result).toBeNull();
  });

  it('no envía el JWT a otros destinos', () => {
    sessionStorage.setItem('shopchain.accessToken', 'private-token');
    for (const url of ['https://example.com/data', `${base}-other/products`]) {
      TestBed.inject(HttpClient).get(url).subscribe();
      const request = http.expectOne(url);
      expect(request.request.headers.has('Authorization')).toBeFalse();
      request.flush({});
    }
  });

  it('un 401 de negocio limpia la autenticación y vuelve al login', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    sessionStorage.setItem('shopchain.accessToken', 'expired-token');
    let succeeded = false;
    TestBed.inject(HttpClient).get(`${base}/products`).subscribe(() => succeeded = true);
    http.expectOne(`${base}/products`).flush({ detail: 'Token vencido.' }, { status: 401, statusText: 'Unauthorized' });
    expect(succeeded).toBeFalse();
    expect(auth.accessToken).toBeNull();
    expect(auth.currentUser).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('un login incorrecto no conserva el token anterior', () => {
    sessionStorage.setItem('shopchain.accessToken', 'old-token');
    let status = 0;
    auth.login(user.email, 'incorrecta').subscribe({ error: (error) => status = error.status });
    http.expectOne(`${base}/auth/login`).flush({ detail: 'Credenciales incorrectas.' }, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
    expect(auth.accessToken).toBeNull();
    expect(auth.currentUser).toBeNull();
  });

  it('envía solo los datos del pedido y muestra el error de stock sin anunciar éxito', () => {
    sessionStorage.setItem('shopchain.accessToken', 'jwt-token');
    const feedback = TestBed.inject(ApiFeedbackService);
    const body = { customer: 'Ana', customerDocument: '12345678', branchId: 2, observations: '', items: [{ productId: 3, quantity: 2, size: 40 }] };
    let saved = false;
    TestBed.inject(OrderService).createOrder(body).subscribe(() => saved = true);
    expect(feedback.pendingWrites()).toBe(1);
    const request = http.expectOne(`${base}/orders`);
    expect(request.request.body).toEqual(body);
    expect(request.request.withCredentials).toBeFalse();
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    expect(request.request.headers.has('X-CSRF-TOKEN')).toBeFalse();
    request.flush({ detail: 'Stock insuficiente.' }, { status: 409, statusText: 'Conflict' });
    expect(saved).toBeFalse();
    expect(feedback.error()).toBe('Stock insuficiente.');
    expect(feedback.pendingWrites()).toBe(0);
  });
});
