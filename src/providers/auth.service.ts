import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';

import { Platform } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { ConfigService } from './config.service';

/*
  Handles all Auth functions
*/
@Injectable()
export class AuthService {

  public isLoggedIn = false;
  private _accessToken;

  private _browser: InAppBrowser;
  private _browserLoadEvents;
  private _browserCloseEvents;

  private _urlBasicAuth: string = "/auth/login";
  private _urlCreateAccount: string = "/auth/create-account";
  private _urlRequestResetPassword: string = "/auth/request-reset-password";

  constructor(
    private _http: Http,
    private _platform: Platform,
    private _config: ConfigService
    ) {}

  /**
   * Basic auth, exchanges access details for a bearer access token to use in 
   * subsequent requests.
   * @param  {string} email
   * @param  {string} password
   */
  basicAuth(email: string, password: string): Observable<any>{
    // Add Basic Auth Header with Base64 encoded email and password
    const authHeader = new Headers();
    authHeader.append("Authorization", "Basic "+ btoa(`${email}:${password}`));

    const url = this._config.apiBaseUrl+this._urlBasicAuth;
    
    return this._http.get(url, {
      headers: authHeader
    }).first();
  }

  /**
   * Creates user account manually based on input
   * @param  {string} fullname
   * @param  {string} email
   * @param  {string} password
   */
  createAccount(fullname:string, email: string, password: string): Observable<any>{
    const url = this._config.apiBaseUrl+this._urlCreateAccount;
    
    return this._http.get(url).first();
  }

  /**
   * Sends a password reset email
   * @param  {string} email
   * @param  {string} password
   */
  resetPassword(email: string): Observable<any>{
    const url = this._config.apiBaseUrl+this._urlRequestResetPassword;
    
    return this._http.get(url).first();
  }

  /**
   * Proceed with Authorizing Google
   */
  authGoogle(){
    this.processAuthFromUrl("https://agent.plugn.io/authmobile/google");
  }

  /**
   * Proceed with Authorizing Windows Live
   */
  authWindowsLive(){
    this.processAuthFromUrl("https://agent.plugn.io/authmobile/live");
  }

  /**
   * Proceed with Authorizing Slack
   */
  authSlack(){
    this.processAuthFromUrl("https://agent.plugn.io/authmobile/slack");
  }

  /**
   * Parse url input, then do action based on that input
   * @param {string} url
   */
  processAuthFromUrl(url: string){
    this._platform.ready().then(() => {
        this._browser = new InAppBrowser(url, "_self", "location=yes,zoom=no");

        // Keep track of urls loaded
        this._browserLoadEvents = this._browser.on("loadstop");
        this._browserLoadEvents = this._browserLoadEvents.map(res => res.url).subscribe(url => {
          this.doActionBasedOnUrl(url);
        });

        // Keep track of browser if closed
        this._browserCloseEvents = this._browser.on("exit").first().subscribe(resp => {
          // Browser closed, unsubscribe from previous observables
          this._browserLoadEvents.unsubscribe();
          this._browserCloseEvents.unsubscribe();
        });
    });
  }

  /**
   * Parse url input, then do action based on that input
   * This function takes the access token from server response
   * 
   * @param {string} url
   */
  doActionBasedOnUrl(url: string){
    if(url.indexOf("?code=") !== -1){

      this._browser.executeScript({
        code: "localStorage.getItem('response')"
      }).then(resp => {
        this._browser.close();
        alert(resp);
      });
    }
  }

}
