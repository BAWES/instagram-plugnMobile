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
    this.loadUrl("https://agent.plugn.io");
  }

  loadUrl(url: string){
    this.platform.ready().then(() => {
        this.browser = new InAppBrowser(url, "_self", "location=yes,zoom=no");

        // Keep track of urls loaded
        this.browserLoadEvents = this.browser.on("loadstart");
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
    console.log("Doing stuff on url", url);
  }

  loadSignupPage(){
    alert("Loading signup page");
  }

  ionViewDidLoad() {
    console.log('Hello Login Page');
  }

}
