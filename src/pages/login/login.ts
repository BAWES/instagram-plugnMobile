import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';

import { TabsPage } from '../tabs/tabs';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/*
  Login Page
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  public loginForm: FormGroup;

  constructor(public navCtrl: NavController, private platform: Platform, private fb: FormBuilder, private auth: AuthService) {
    // Initialize the Login Form
    this.loginForm = fb.group({
      emailInput: ["", Validators.required],
      passwordInput: ["", Validators.required]
    });
  }

  ionViewDidLoad() {
    //console.log('Hello Login Page');
  }

  /**
   * Attempts to login with the provided email and password
   */
  onSubmit(){
    // console.log(JSON.stringify(form.errors));
    // console.log(form.dirty);
    // console.log(form.valid);
    console.log(JSON.stringify(this.loginForm.value));
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
