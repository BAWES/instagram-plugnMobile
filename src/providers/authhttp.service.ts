import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';

import { InAppBrowser } from 'ionic-native';

import { ConfigService } from './config.service';
import { AuthService } from './auth.service';

/*
  Handles all Authorized HTTP functions with Bearer Token
*/
@Injectable()
export class AuthHttpService {

  constructor(
    private _http: Http,
    private _auth: AuthService,
    private _config: ConfigService
    ) {}
  

  /**
   * Build the Auth Headers for All Verb Requests
   * @returns {Headers}
   */
  private _buildAuthHeaders(){
    // Get Bearer Token from Auth Service
    const bearerToken = this._auth.getAccessToken();

    // Build Headers with Bearer Token
    const headers = new Headers();
    headers.append("Authorization", "Bearer "+ bearerToken);
    headers.append("Content-Type", "application/json");

    return headers;
  }

  /**
   * Requests via GET verb
   * @param {string} endpointUrl
   * @returns {Observable<any>}
   */
  get(endpointUrl: string): Observable<any>{
    const url = this._config.apiBaseUrl + endpointUrl;

    return this._http.get(url, {headers: this._buildAuthHeaders()})
              .first()
              .map((res: Response) => res.json());
  }

  /**
   * Requests via POST verb
   * @param {string} endpointUrl
   * @param {*} params
   * @returns {Observable<any>}
   */
  post(endpointUrl: string, params: any): Observable<any>{
    const url = this._config.apiBaseUrl + endpointUrl;

    return this._http.post(url, JSON.stringify(params), {headers: this._buildAuthHeaders()})
              .first()
              .map((res: Response) => res.json());
  }

}
