import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';

import { TabsPage } from '../tabs/tabs';

/*
  Login Page
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {


  constructor(public navCtrl: NavController, private platform: Platform, private auth: AuthService) {
    
  }

  ionViewDidLoad() {
    //console.log('Hello Login Page');
  }

  /**
   * Begin Authorization process via Oauth2
   * 
   * @param {string} oauthName
   */
  authorizeVia(oauthName: string){
    switch(oauthName){
      case "Google":
        this.auth.authGoogle();
        break;
      case "Live":
        this.auth.authWindowsLive();
        break;
      case "Slack":
        this.auth.authSlack();
        break;
    }
  }

  navigate(){
    this.navCtrl.push(TabsPage);
  }

  loadSignupPage(){
    alert("Loading signup page");
  }

}
