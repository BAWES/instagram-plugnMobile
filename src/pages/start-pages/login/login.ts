// Core
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
// Services
import { AuthService } from '../../../providers/auth.service';
import { KeyboardService } from '../../../providers/keyboard.service';
// Pages
import { RegisterPage } from '../register/register';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
// Forms
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom.validator';

/*
  Login Page
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  public loginForm: FormGroup;

  // Disable submit button if loading response
  public isLoading = false;

  // Store old email and password to make sure user won't make same mistake twice
  public oldEmailInput = "";
  public oldPasswordInput = "";

  // Store number of invalid password attempts to suggest reset password 
  private _numberOfLoginAttempts = 0;

  constructor(
    public navCtrl: NavController, 
    private _fb: FormBuilder, 
    private _auth: AuthService,
    private _alertCtrl: AlertController,
    public keyboard: KeyboardService,
    ){
      // Initialize the Login Form
      this.loginForm = this._fb.group({
        email: ["", [Validators.required, CustomValidator.emailValidator]],
        password: ["", Validators.required]
      });
    }

  ionViewDidLoad() {
    
  }


  /**
   * Attempts to login with the provided email and password
   */
  onSubmit(){
    this.isLoading = true;

    const email = this.oldEmailInput = this.loginForm.value.email;
    const password = this.oldPasswordInput = this.loginForm.value.password;
    

    this._auth.basicAuth(email, password).subscribe(res => {
      this.isLoading = false;

      if(res.operation == "success"){
        // Successfully logged in, set the access token within AuthService
        this._auth.setAccessToken(res.token);
      }else if(res.operation == "error" && res.errorType == "email-not-verified"){
        let alert = this._alertCtrl.create({
            title: 'Email not verified',
            message: res.message,
            buttons: [
              'Try Again',
              {
                text: 'Re-send Email',
                handler: () => this.resendVerificationEmail(email)
              }
            ],
          });
          alert.present();
      }else if(res.operation == "error"){
        let alert = this._alertCtrl.create({
          title: 'Unable to Log In',
          message: res.message,
          buttons: ['Ok'],
        });
        alert.present();
      }

      
    }, err => {
      this.isLoading = false;
      
      // Incorrect email or password
      if(err.status == 401){
        this._numberOfLoginAttempts++;

        // Check how many login attempts this user made, offer to reset password
        if(this._numberOfLoginAttempts > 2){
          let alert = this._alertCtrl.create({
            title: 'Trouble Logging In?',
            message: "If you've forgotten your password, we can help you get back into your account.",
            buttons: [
              {
                text: 'Forgot Password',
                handler: () => {
                  this.loadForgotPasswordPage();
                }
              }, 
                'Try Again'
              ],
          });
          alert.present();
        }
        else{
          let alert = this._alertCtrl.create({
            title: 'Invalid email or password',
            message: 'The information entered is incorrect. Please try again.',
            buttons: ['Try Again'],
          });
          alert.present();
        }
      }else{
        /**
         * Error not accounted for. Show Message
         */
        let alert = this._alertCtrl.create({
            title: 'Unable to Log In',
            message: "There seems to be an issue connecting to Plugn servers. Please contact us if the issue persists.",
            buttons: ['Ok'],
          });
          alert.present();
      }
    });
  }

  /**
   * Resend Verification Email to Specified Email
   * @param  {string} email
   */
  resendVerificationEmail(email: string){
    this._auth.resendVerificationEmail(email).subscribe(res => {

      if(res.operation == "success"){
        let alert = this._alertCtrl.create({
          title: 'Verification Email Sent',
          message: res.message,
          buttons: ['Ok'],
        });
        alert.present();
      }else if(res.operation == "error"){
        let alert = this._alertCtrl.create({
          title: 'Unable to resend email',
          message: res.message,
          buttons: ['Ok'],
        });
        alert.present();
      }
    }, err => {
      /**
       * Error not accounted for. Show Message
       */
      let alert = this._alertCtrl.create({
        title: 'Unable to Resend Verification Email',
        message: "There seems to be an issue connecting to Plugn servers. Please contact us if the issue persists.",
        buttons: ['Ok'],
      });
      alert.present();
    });
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

  

  loadForgotPasswordPage(){
    this.navCtrl.push(ForgotPasswordPage);
  }

  loadSignupPage(){
    this.navCtrl.push(RegisterPage);
  }

}
