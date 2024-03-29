import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/map';

import { Platform, Events, LoadingController, AlertController } from 'ionic-angular';
import { InAppBrowser, NativeStorage, GooglePlus } from 'ionic-native';

import { ConfigService } from './config.service';

/*
  Handles all Auth functions
*/
@Injectable()
export class AuthService {

  public isLoggedIn = false;

  // Logged in agent details
  private _accessToken;
  public agentId: number;
  public name: string;
  public email: string;

  private _browser: InAppBrowser;
  private _browserLoadEvents;
  private _browserCloseEvents;

  private _urlBasicAuth: string = "/auth/login";
  private _urlValidateGoogle: string = "/auth/validate";
  private _urlCreateAccount: string = "/auth/create-account";
  private _urlRequestResetPassword: string = "/auth/request-reset-password";
  private _urlResendVerificationEmail: string = "/auth/resend-verification-email";
  private _urlVerifyEmail: string = "/auth/verify";
  private _urlResetPassword: string = "/auth/update-password";

  constructor(
    private _http: Http,
    private _platform: Platform,
    private _config: ConfigService,
    private _events: Events,
    private _alertCtrl: AlertController,
    private _loadingCtrl: LoadingController
    ) {
      _platform.ready().then(() => {
        this._updateLoginStatus();
      });
    }

  /**
   * Sets this.isLoggedIn based on availability of BEARER Access Token
   */
  private _updateLoginStatus(){
    if(this.getAccessToken()){
      this.isLoggedIn = true;
    }else{
      this.isLoggedIn = false;
      this._events.publish("user:logout");
    }
  }

  /**
   * Logs a user out by setting logged in to false and clearing token from localStorage
   * @param {string} [reason]
   */
  logout(reason?: string){
    // Remove from LocalStorage
    window.localStorage.removeItem('bearer');
    window.localStorage.removeItem('agentId');
    window.localStorage.removeItem('name');
    window.localStorage.removeItem('email');

    // Remove from NativeStorage if this is iOS or Android
    if(this._platform.is("cordova") && (this._platform.is("ios") || this._platform.is("android"))){
      NativeStorage.remove("loggedInAgent").then(() => {
        // alert("deleted from nativestorage");
      });
      // Delete Access Token for Google Auth
      GooglePlus.logout();
    }

    this._accessToken = null;
    this._updateLoginStatus();

    this._events.publish('user:logout', reason?reason:false);
  }

  /**
   * Set the access token
   * @param {string} token
   * @param {number} id
   * @param {string} name
   * @param {string} email
   */
  setAccessToken(token: string, id: number, name: string, email: string){
    this._accessToken = token;
    this.name = name;
    this.agentId = id;
    this.email = email;

    // Update Public Login Status
    this._updateLoginStatus();

    // Save Token in LocalStorage
    window.localStorage.setItem('bearer', token);
    window.localStorage.setItem('agentId', id+"");
    window.localStorage.setItem('name', name);
    window.localStorage.setItem('email', email);

    // Save in NativeStorage if iOS and Android
    if(this._platform.is("cordova") && (this._platform.is("ios") || this._platform.is("android"))){
      NativeStorage.setItem('loggedInAgent', {
        'bearer': token, 
        'agentId': id+"",
        'name': name,
        'email': email
      }).then(
        () => {
          // alert("Saved in nativestorage");
        },
        error => console.error('Error storing access token', error)
      );
    }

    // Log User In by Triggering Event that Access Token has been Set
    this._events.publish('user:login', 'TokenSet');
  }

  /**
   * Get Access Token from Service or LocalStorage
   * @returns {string} token
   */
  getAccessToken(){
    // Return Access Token if set already
    if(this._accessToken){
      return this._accessToken;
    }

    // Check Local Storage and Try Again
    if(localStorage.getItem("bearer")){
      this.setAccessToken(
        localStorage.getItem("bearer"),
        +localStorage.getItem("agentId"),
        localStorage.getItem("name"),
        localStorage.getItem("email"));
      return this.getAccessToken();
    }

    // Check Native Storage and Try Again
    // Native storage is implemented because some devices clear LocalStorage regularly to save memory
    if(this._platform.is("cordova") && (this._platform.is("ios") || this._platform.is("android"))){
      NativeStorage.getItem('loggedInAgent')
      .then(
        data => {
          this.setAccessToken(data.bearer, data.agentId, data.name, data.email);
          return this.getAccessToken();
        },
        error => console.error(error)
      );
    }
    

    // No Access Token Available
    return false;
  }

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
      })
      .first()
      .map((res: Response) => res.json());
  }

  /**
   * Creates user account manually based on input
   * @param  {string} fullname
   * @param  {string} email
   * @param  {string} password
   */
  createAccount(fullname:string, email: string, password: string): Observable<any>{
    const headers = new Headers({'Content-Type': 'application/json'});
    const url = this._config.apiBaseUrl+this._urlCreateAccount;

    return this._http.post(url, JSON.stringify({
        'fullname': fullname,
        'email': email,
        'password': password,
      }), {headers: headers})
      .first()
      .map((res: Response) => res.json());
  }

  /**
   * Re-send verification email
   * @param  {string} email
   */
  resendVerificationEmail(emailInput: string): Observable<any>{
    const headers = new Headers({'Content-Type': 'application/json'});
    const url = this._config.apiBaseUrl+this._urlResendVerificationEmail;

    return this._http.post(url, JSON.stringify({'email': emailInput}), {headers: headers})
              .first()
              .map((res: Response) => res.json());
  }

  /**
   * Verify Email
   * @param  {string} code
   * @param  {number} verify
   */
  verifyEmail(code: string, verify: number): Observable<any>{
    const headers = new Headers({'Content-Type': 'application/json'});
    const url = this._config.apiBaseUrl+this._urlVerifyEmail;

    return this._http.patch(url, JSON.stringify({'code': code, 'verify': verify}), {headers: headers})
              .first()
              .map((res: Response) => res.json());
  }

  /**
   * Resets password based on provided Token and New Password
   * @param  {string} token
   * @param  {string} newPassword
   */
  resetPasswordViaToken(token: string, newPassword: string): Observable<any>{
    const headers = new Headers({'Content-Type': 'application/json'});
    const url = this._config.apiBaseUrl+this._urlResetPassword;

    return this._http.patch(url, JSON.stringify({'token': token, 'newPassword': newPassword}), {headers: headers})
              .first()
              .map((res: Response) => res.json());
  }

  /**
   * Requests a password reset email
   * @param  {string} email
   */
  resetPassword(emailInput: string): Observable<any>{
    const headers = new Headers({'Content-Type': 'application/json'});
    const url = this._config.apiBaseUrl+this._urlRequestResetPassword;

    return this._http.post(url, JSON.stringify({'email': emailInput}), {headers: headers})
              .first()
              .map((res: Response) => res.json());
  }

  /**
   * Proceed with Authorizing Google
   */
  authGoogle(){
    // If iOS or Android, attempt native Google Auth
    if(this._platform.is("mobile")) 
    {
      // Native Google Login Options
      const loginOptions = {
        'webClientId': '882152609344-ahm24v4mttplse2ahf35ffe4g0r6noso.apps.googleusercontent.com',
        //'scopes': 'profile email',
        //'offline': true, 
      };

      GooglePlus.login(loginOptions)
        .then(res => {
          const idToken = res.idToken;
          const displayName = res.displayName;

          // Show Loading
          let loading = this._loadingCtrl.create({
            spinner: 'crescent',
            content: 'Logging in..'
          });
          loading.present();
          
          // Validate and login on server using the id token
          const headers = new Headers({'Content-Type': 'application/json'});
          const url = this._config.apiBaseUrl+this._urlValidateGoogle;

          this._http.post(url, JSON.stringify({
              'id_token': idToken,
              'displayName': displayName
            }), {headers: headers})
            .first()
            .map((res: Response) => res.json())
            .subscribe(jsonResponse => {
              // Dismiss Loading 
              loading.dismiss();

              if(jsonResponse.operation == "success"){
                // Successfully logged in, set the access token
                this.setAccessToken(jsonResponse.token, +jsonResponse.agentId, jsonResponse.name, jsonResponse.email);
              }else if(jsonResponse.operation == "error"){
                let alert = this._alertCtrl.create({
                  title: 'Unable to Log In',
                  message: jsonResponse.message,
                  buttons: ['Ok'],
                });
                alert.present();
              }
              
            });
            
            return;
        })
        .catch(err => {
          // Unsuccessful login
          //alert(JSON.stringify(err));
          // This method is also called in the case where user clicks login button then changes mind
          
        });
    }
    
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
        this._browser = new InAppBrowser(url, this._config.browserTarget, this._config.browserOptions);

        // Keep track of urls loaded
        this._browserLoadEvents = this._browser.on("loadstop");
        this._browserLoadEvents = this._browserLoadEvents.map(res => res.url).subscribe(url => {
          this._doActionBasedOnUrl(url);
        });

        // Keep track of browser if closed
        this._browserCloseEvents = this._browser.on("exit").subscribe(resp => {
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
  private _doActionBasedOnUrl(url: string){
    if(url.indexOf("?code=") !== -1){

      this._browser.executeScript({
        code: "localStorage.getItem('response')"
      }).then(resp => {
        this._browser.close();

        resp = resp+""; // cast to str
        let agentInfo = resp.split(':!:');

        // Set the access token
        this.setAccessToken(agentInfo[0], agentInfo[1], agentInfo[2], agentInfo[3]);
      });
    }
  }

}
