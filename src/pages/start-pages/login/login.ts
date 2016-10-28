// Core
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// Services
import { AuthService } from '../../../providers/auth.service';
import { KeyboardService } from '../../../providers/keyboard.service';
// Pages
import { RegisterPage } from '../register/register';
// Forms
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

  public randomBoolean = false;

  constructor(
    public navCtrl: NavController, 
    private _fb: FormBuilder, 
    private _auth: AuthService,
    public keyboard: KeyboardService,
    ){}


  ionViewDidLoad() {
    // Initialize the Login Form
    this.loginForm = this._fb.group({
      email: ["", Validators.required],
      password: ["", Validators.required]
    });
    

    //this.infiniteLoop();
  }

  ionViewDidLeave(){
    console.log("Login Page has left");
    //Unsubscribe from Keyboard on Native here maybe?
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
        this._auth.authGoogle();
        break;
      case "Live":
        this._auth.authWindowsLive();
        break;
      case "Slack":
        this._auth.authSlack();
        break;
    }
  }

  navigate(){
    //this.navCtrl.push(TabsPage);
  }

  loadSignupPage(){
    this.navCtrl.setRoot(RegisterPage);
  }

}
