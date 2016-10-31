// Core
import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
// Services
import { AuthService } from '../../../providers/auth.service';
// Pages
import { LoginPage } from '../login/login';
// Forms
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/*
  Register Page
*/
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

  public registerForm: FormGroup;

  constructor(
    public navCtrl: NavController, 
    private platform: Platform, 
    private fb: FormBuilder, 
    private auth: AuthService,
    ) 
  {
    // Initialize the Registration Form
    this.registerForm = fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  ionViewDidLoad() {
    console.log('Hello Register Page');
  }

  /**
   * Attempts to login with the provided email and password
   */
  onSubmit(){
    // console.log(JSON.stringify(form.errors));
    // console.log(form.dirty);
    // console.log(form.valid);
    console.log(JSON.stringify(this.registerForm.value));
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
    //this.navCtrl.push(TabsPage);
  }

  loadLoginPage(){
    this.navCtrl.pop();
  }

}
