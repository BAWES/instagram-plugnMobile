import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';

import { Events } from 'ionic-angular';

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
    private _config: ConfigService,
    private _events: Events
    ) {}

  /**
   * Requests via GET verb
   * @param {string} endpointUrl
   * @returns {Observable<any>}
   */
  get(endpointUrl: string): Observable<any>{
    const url = this._config.apiBaseUrl + endpointUrl;

    return this._http.get(url, {headers: this._buildAuthHeaders()})
              .catch(this._handleError)
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
              .catch(this._handleError)
              .first()
              .map((res: Response) => res.json());
  }

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
   * Handles Caught Errors from All Authorized Requests Made to Server
   * @returns {Observable} 
   */
  private _handleError(error: any) {
      let errMsg = (error.message) ? error.message :
          error.status ? `${error.status} - ${error.statusText}` : 'Server error';

      alert(errMsg);

      if (error.status === 401) {
          this._events.publish('user:loginExpired', 'TokenExpired');
          return Observable.empty<Response>();
      }

      return Observable.throw(errMsg);
  }

}
