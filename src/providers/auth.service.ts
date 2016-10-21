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

  private browser: InAppBrowser;
  private browserLoadEvents;
  private browserCloseEvents;

  constructor(public http: Http, private platform: Platform) {
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
    this.platform.ready().then(() => {
        this.browser = new InAppBrowser(url, "_self", "location=yes,zoom=no");

        // Keep track of urls loaded
        this.browserLoadEvents = this.browser.on("loadstop");
        this.browserLoadEvents = this.browserLoadEvents.map(res => res.url).subscribe(url => {
          this.doActionBasedOnUrl(url);
        });

        // Keep track of browser if closed
        this.browserCloseEvents = this.browser.on("exit").first().subscribe(resp => {
          // Browser closed, unsubscribe from previous observables
          this.browserLoadEvents.unsubscribe();
          this.browserCloseEvents.unsubscribe();
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

      this.browser.executeScript({
        code: "localStorage.getItem('response')"
      }).then(resp => {
        this.browser.close();
        alert(resp);
      });
    }
  }

}
