import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export const SKIP_401 = new HttpContextToken<boolean>(() => false);

// Service for handling server requests
@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  envAdress: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.envAdress = baseUrl
  }

  /**
   * GET request
   * @param route endpoint relativo
   * @returns Observable con datos retornados por el server
   */
  public getData<T>(route: string, skip401: boolean = false): Observable<HttpResponse<T>> {
    return this.http.get<T>(this.createCompleteRoute(route), { headers: this.generateHeaders(), observe: 'response', context: new HttpContext().set(SKIP_401, skip401) });
  }

  /**
   * POST request
   * @param route endpoint relativo
   * @param body contenidos JSON requeridos por endpoint
   * @returns Observable con datos retornados por el server
   */
  public create<T>(route: string, body: any, skip401: boolean = false, contentType: string = 'application/json'): Observable<HttpResponse<T>> {
    let url = this.createCompleteRoute(route)
    console.log("route:", url)
    return this.http.post<T>(url, body, { headers: this.generateHeaders(contentType), observe: 'response', context: new HttpContext().set(SKIP_401, skip401) });
  }

  /**
   * DELETE request
   * @param route endpoint relativo
   * @returns Observable con datos retornados por el server
   */
  public delete<T>(route: string, skip401: boolean = false): Observable<HttpResponse<T>> {
    return this.http.delete<T>(this.createCompleteRoute(route), { headers: this.generateHeaders(), observe: 'response', context: new HttpContext().set(SKIP_401, skip401) });
  }

  /**
 * PUT request
 * @param route endpoint relativo
 * @param body contenidos JSON requeridos por endpoint
 * @returns Observable con datos retornados por el server
 */
  public replace<T>(route: string, body: any, skip401: boolean = false, contentType: string = 'application/json'): Observable<HttpResponse<T>> {
    return this.http.put<T>(this.createCompleteRoute(route), body, { headers: this.generateHeaders(contentType), observe: 'response', context: new HttpContext().set(SKIP_401, skip401) });
  }

  /**
   * PATCH request
   * @param route endpoint relativo
   * @param body contenidos JSON requeridos por endpoint
   * @returns Observable con datos retornados por el server
   */
  public edit<T>(route: string, body: any, skip401: boolean = false, contentType: string = 'application/json'): Observable<HttpResponse<T>> {
    return this.http.patch<T>(this.createCompleteRoute(route), body, { headers: this.generateHeaders(contentType), observe: 'response', context: new HttpContext().set(SKIP_401, skip401) });
  }

  // Junta el url base del API con la ruta relative de los
  private createCompleteRoute = (route: string) => {
    return `${this.envAdress}Api/${route}`;
  }

  private generateHeaders = (contentType: string | undefined = undefined) => {
    let headers = new HttpHeaders({
      // "Access-Control-Allow-Origin": "*", // este header es para permitir todos los CORS necesarios de los requests
      ...(contentType ? { 'Content-Type': contentType } : {}),
      ...(environment.production ? {} : { "Access-Control-Allow-Origin": "*" })
    })
    console.log("headers:", headers)
    return headers

  }
}