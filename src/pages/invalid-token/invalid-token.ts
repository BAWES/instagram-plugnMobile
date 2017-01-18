import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';

/*
  Invalid Token Page
*/
@Component({
  selector: 'page-invalid-token',
  templateUrl: 'invalid-token.html'
})
export class InvalidTokenPage {

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
