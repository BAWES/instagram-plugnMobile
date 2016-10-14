import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import {InAppBrowser} from 'ionic-native';

import { TabsPage } from '../tabs/tabs';

/*
  Login Page
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  private browser;

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
    });
  }

  loadSignupPage(){
    alert("Loading signup page");
  }

  ionViewDidLoad() {
    console.log('Hello Login Page');
  }

}
