// Core
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
// Services
import { AuthService } from '../../../providers/auth.service';
import { KeyboardService } from '../../../providers/keyboard.service';
// Pages
import { RegisterPage } from '../register/register';
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
    ){}


  ionViewDidLoad() {
    // Initialize the Login Form
    this.loginForm = this._fb.group({
      email: ["", [Validators.required, CustomValidator.emailValidator]],
      password: ["", Validators.required]
    });
    
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

    this.isLoading = true;

    const email = this.oldEmailInput = this.loginForm.value.email;
    const password = this.oldPasswordInput = this.loginForm.value.password;
    

    this._auth.basicAuth(email, password).subscribe(res => {
      this.isLoading = false;
      console.log(JSON.stringify(res));
      
    }, err => {
      this.isLoading = false;
      console.log(JSON.stringify(err));
      
      // Incorrect email or password
      if(err.status == 401){
        this._numberOfLoginAttempts++;

        // Check how many login attempts this user made, offer to reset password
        if(this._numberOfLoginAttempts > 2){
          let alert = this._alertCtrl.create({
            title: 'Trouble Logging In?',
            message: "If you've forgotten your password, we can help you get back into your account.",
            buttons: ['Try Again', 'Forgot Password'],
          });
          alert.present();
        }
        else{
          let alert = this._alertCtrl.create({
            title: 'Invalid email or password',
            message: 'The details you entered are incorrect. Please try again.',
            buttons: ['Try Again'],
          });
          alert.present();
        }
        
      }
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

  navigate(){
    //this.navCtrl.push(TabsPage);
  }

  loadSignupPage(){
    this.navCtrl.setRoot(RegisterPage);
  }

}
