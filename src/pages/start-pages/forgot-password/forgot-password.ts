// Core
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
// Services
import { AuthService } from '../../../providers/auth.service';
import { KeyboardService } from '../../../providers/keyboard.service';
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
    public keyboard: KeyboardService,
    ){}


  ionViewDidLoad() {
    // Initialize the Password Reset Form
    this.resetForm = this._fb.group({
      email: ["", [Validators.required, CustomValidator.emailValidator]],
    });  
  }

  /**
   * Attempts to reset with the provided email
   */
  onSubmit(){
    this.isLoading = true;

    const email = this.resetForm.value.email;

    this._auth.resetPassword(email).subscribe(res => {
      this.isLoading = false;
      console.log(JSON.stringify(res));
      
    }, err => {
      this.isLoading = false;
      console.log(JSON.stringify(err));

    });
  }



}
