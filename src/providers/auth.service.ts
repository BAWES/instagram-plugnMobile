import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';

import { Platform } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

/*
  Handles all Auth functions
*/
@Injectable()
export class AuthService {

  public isLoggedIn = false;

  private _browser: InAppBrowser;
  private _browserLoadEvents;
  private _browserCloseEvents;

  constructor(private _http: Http, private _platform: Platform) {
    //console.log('Constructed the Auth Service, now ready to check login status');
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
