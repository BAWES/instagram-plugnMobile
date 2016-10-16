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


  constructor(public navCtrl: NavController, private platform: Platform, private auth: AuthService) {}

  navigate(){
    this.navCtrl.push(TabsPage);
  }

  /**
   * Proceed with Authorizing Google
   */
  authGoogle(){
    this.auth.processAuthFromUrl("https://agent.plugn.io/authmobile/google");
  }

  /**
   * Proceed with Authorizing Windows Live
   */
  authWindowsLive(){
    this.auth.processAuthFromUrl("https://agent.plugn.io/authmobile/live");
  }

  /**
   * Proceed with Authorizing Slack
   */
  authSlack(){
    this.auth.processAuthFromUrl("https://agent.plugn.io/authmobile/slack");
  }

  loadSignupPage(){
    alert("Loading signup page");
  }

  ionViewDidLoad() {
    console.log('Hello Login Page');
  }

}
