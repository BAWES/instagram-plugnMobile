// Core
import { Component, ApplicationRef } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
// Services
import { AuthService } from '../../../providers/auth.service';
import { KeyboardService } from '../../../providers/keyboard.service';
import { AnalyticsService } from '../../../providers/analytics.service';
// Forms
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom.validator';

/*
  Login Page
*/
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

  public signupForm: FormGroup;

  // Disable submit button if loading response
  public isLoading = false;

  // Event Handlers to Unsubscribe from 
  private _keyboardToggleHandler;

  constructor(
    public navCtrl: NavController, 
    private _fb: FormBuilder, 
    private _auth: AuthService,
    private _analytics: AnalyticsService,
    private _alertCtrl: AlertController,
    private _events: Events,
    public keyboard: KeyboardService,
    private _ref:ApplicationRef
    ){
      // Initialize the Registration Form
      this.signupForm = this._fb.group({
        fullname: ["", [Validators.required]],
        email: ["", [Validators.required, CustomValidator.emailValidator]],
        password: ["", Validators.required]
      }); 
  }

  ionViewDidEnter() {
    this._analytics.trackView("Registration Page");

    // Force trigger Angular2 Change Detection when keyboard opens and closes
    this._events.subscribe("keyboard:toggle", this._keyboardToggleHandler = (keyboardData) => {
      this._ref.tick();
    });
  }

  ionViewWillLeave(){
    this._events.unsubscribe("keyboard:toggle", this._keyboardToggleHandler);
  }


  /**
   * Attempts to login with the provided email and password
   */
  onSubmit(){
    this.isLoading = true;

    const fullname = this.signupForm.value.fullname;
    const email = this.signupForm.value.email;
    const password = this.signupForm.value.password;

    this._auth.createAccount(fullname, email, password).subscribe(res => {
      this.isLoading = false;
      console.log(JSON.stringify(res));

      if(res.operation == "success"){
        let alert = this._alertCtrl.create({
          title: 'Thanks, you are almost done',
          message: res.message,
          buttons: [{
            text: 'Awesome',
            handler: data => {
              this.navCtrl.pop();
            }
          }],
        });
        alert.present();
      }else if(res.operation == "error"){
        let alert = this._alertCtrl.create({
          title: 'Unable to Create Account',
          message: res.message,
          buttons: ['Ok'],
        });
        alert.present();
      }
      
    }, err => {
      this.isLoading = false;
      /**
       * Error not accounted for. Show Message
       */
      let alert = this._alertCtrl.create({
        title: 'Unable to Reset Password',
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

  loadLoginPage(){
    this.navCtrl.pop();
  }

}
