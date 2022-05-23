import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { EnvironmentUrlService } from './environment-url.service';
import { Observable } from 'rxjs';

// Service for handling server requests

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) { }

  /**
   * GET request
   * @param route endpoint relativo
   * @returns Observable con datos retornados por el server
   */
  public getData<T>(route: string): Observable<HttpResponse<T>> {
    return this.http.get<T>(this.createCompleteRoute(route, this.envUrl.urlAddress), { headers: this.generateHeaders(), observe: 'response' });
  }

  /**
   * POST request
   * @param route endpoint relativo
   * @param body contenidos JSON requeridos por endpoint
   * @returns Observable con datos retornados por el server
   */
  public create<T>(route: string, body: any, contentType: string = 'application/json'): Observable<HttpResponse<T>> {
    return this.http.post<T>(this.createCompleteRoute(route, this.envUrl.urlAddress), body, { headers: this.generateHeaders(contentType), observe: 'response' });
  }

  /**
   * DELETE request
   * @param route endpoint relativo
   * @returns Observable con datos retornados por el server
   */
  public delete<T>(route: string): Observable<HttpResponse<T>> {
    return this.http.delete<T>(this.createCompleteRoute(route, this.envUrl.urlAddress), { headers: this.generateHeaders(), observe: 'response' });
  }

  /**
 * PUT request
 * @param route endpoint relativo
 * @param body contenidos JSON requeridos por endpoint
 * @returns Observable con datos retornados por el server
 */
  public edit<T>(route: string, body: any, contentType: string = 'application/json'): Observable<HttpResponse<T>> {
    return this.http.put<T>(this.createCompleteRoute(route, this.envUrl.urlAddress), body, { headers: this.generateHeaders(contentType), observe: 'response' });
  }

  // Junta el url base del API con la ruta relative de los
  private createCompleteRoute = (route: string, envAddress: string) => {
    return `${envAddress}API/${route}`;
  }

  private generateHeaders = (contentType: string | undefined = undefined) => {
    return new HttpHeaders({
      // "Access-Control-Allow-Origin": "*", // este header es para permitir todos los CORS necesarios de los requests
      ...(contentType ? { 'Content-Type': contentType } : {})
    })

  }
}