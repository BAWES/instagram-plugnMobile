import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';
import { AnalyticsService } from '../../providers/analytics.service';

/*
  Class for the add-account page.
*/
@Component({
  selector: 'page-add-account',
  templateUrl: 'add-account.html'
})
export class AddAccountPage {

  constructor(
    public navCtrl: NavController, 
    public auth: AuthService,
    private _analytics: AnalyticsService
    ) {}

  ionViewDidEnter() {
    this._analytics.trackView("Add Account Page");
  }

  ionViewDidLoad() {
    //console.log('Hello Add Account Page');
  }

}
