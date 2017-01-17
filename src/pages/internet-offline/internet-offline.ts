import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';

/*
  Internet Offline Page
*/
@Component({
  selector: 'page-internet-offline',
  templateUrl: 'internet-offline.html'
})
export class InternetOfflinePage {

  constructor(
    public navCtrl: NavController, 
    public auth: AuthService,
    private _events: Events,
    ) {}

  /**
   * Attempts to reconnect to Plugn Servers
   */
  attemptReconnect(){
    this._events.publish("accountAssignment:removed");
  }


}
