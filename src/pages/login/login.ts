import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import {InAppBrowser} from 'ionic-native';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';

import { TabsPage } from '../tabs/tabs';

/*
  Login Page
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  private browser: InAppBrowser;
  private browserLoadEvents;
  private browserCloseEvents;

  constructor(public navCtrl: NavController, private platform: Platform) {}

  navigate(){
    this.navCtrl.push(TabsPage);
  }

  authGoogle(){
    console.log("Attempting to auth google");
    this.loadUrl("https://agent.plugn.io/authmobile/google");
  }

  loadUrl(url: string){
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
          console.log("Window closed, unsubscribed from observables");
        });
    });
  }

  doActionBasedOnUrl(url){
    console.log("Analyzing url", url);
    //Handle Google auth
    if(url.indexOf("google?code=") !== -1){

      console.log("Found Google Success Page, outputting response");
      this.browser.executeScript({
        code: "localStorage.getItem('response')"
      }).then(resp => alert(resp));

      //Change above function in Backend to return a valid access token
      //Now need to store the returned access token in the AuthService
      
      
      //This access token will now be used to validate successful login
      //That same validation function will be used after we exchange normal login (user/pass) for token

      //this.browser.close();
    }
  }

  loadSignupPage(){
    alert("Loading signup page");
  }

  ionViewDidLoad() {
    console.log('Hello Login Page');
  }

}
