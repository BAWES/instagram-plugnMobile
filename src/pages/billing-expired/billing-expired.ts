import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';

/*
  Billing Expired Page
*/
@Component({
  selector: 'page-billing-expired',
  templateUrl: 'billing-expired.html'
})
export class BillingExpiredPage {

  constructor(
    public navCtrl: NavController, 
    public auth: AuthService,
    private _events: Events,
    ) {}

  /**
   * Attempts to reconnect to Plugn Servers
   */
  attemptReconnect(){
    //this._events.publish("accountAssignment:removed");
  }


}
