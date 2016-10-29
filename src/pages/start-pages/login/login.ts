// Core
import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController } from 'ionic-angular';
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

  constructor(
    public navCtrl: NavController, 
    private _fb: FormBuilder, 
    private _auth: AuthService,
    private _loadingCtrl: LoadingController,
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
    this.isLoading = true;

    let loader = this._loadingCtrl.create({
      content: "Please wait...",
    });
    loader.present();


    // console.log(JSON.stringify(form.errors));
    // console.log(form.dirty);
    // console.log(form.valid);
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    

    this._auth.basicAuth(email, password).subscribe(res => {
      loader.dismiss();
      console.log(JSON.stringify(res));
      
    }, err => {
      loader.dismiss();
      console.log(JSON.stringify(err));
      
      // Incorrect email or password
      if(err.status == 401){
        let alert = this._alertCtrl.create({
          title: 'Invalid email or password',
          buttons: ['Try again']
        });
        alert.present();
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
