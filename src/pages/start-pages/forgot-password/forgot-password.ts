// Core
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
// Services
import { AuthService } from '../../../providers/auth.service';
import { KeyboardService } from '../../../providers/keyboard.service';
import { AnalyticsService } from '../../../providers/analytics.service';
// Forms
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom.validator';

/*
  Forgot Password Page
*/
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html'
})
export class ForgotPasswordPage {

  public resetForm: FormGroup;

  // Disable submit button if loading response
  public isLoading = false;

  constructor(
    public navCtrl: NavController, 
    private _fb: FormBuilder, 
    private _auth: AuthService,
    private _alertCtrl: AlertController,
    private _analytics: AnalyticsService,
    public keyboard: KeyboardService,
    ){
      // Initialize the Password Reset Form
      this.resetForm = this._fb.group({
        email: ["", [Validators.required, CustomValidator.emailValidator]],
      });  
    }


  ionViewDidEnter() {
    this._analytics.trackView("Forgot Password");
  }

  /**
   * Attempts to reset with the provided email
   */
  onSubmit(){
    this.isLoading = true;

    const email = this.resetForm.value.email;

    this._auth.resetPassword(email).subscribe(res => {
      this.isLoading = false;

      if(res.operation == "success"){
        let alert = this._alertCtrl.create({
          title: 'Reset Email Sent',
          message: res.message,
          buttons: [{
            text: 'Cool',
            handler: data => {
              this.navCtrl.pop();
            }
          }],
        });
        alert.present();
      }else if(res.operation == "error"){
        let alert = this._alertCtrl.create({
          title: 'Unable to Reset Password',
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



}
