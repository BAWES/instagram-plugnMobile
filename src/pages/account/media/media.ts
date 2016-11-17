import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { MediaService } from '../../../providers/logged-in/media.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

/*
  Media page.
*/
@Component({
  selector: 'page-media',
  templateUrl: 'media.html'
})
export class MediaPage {

  constructor(
    public navCtrl: NavController, 
    public media: MediaService,
    public accounts: AccountService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService
    ) {}

  ionViewDidLoad() {
    // Initialize Class Here If Needed
  }

  ionViewDidEnter() {
    // Setup Back Button Behavior
    this._backBtn.toggleMenuOnBack();
  }

  /**
   * Trigger an event notifying that user is opening this page
   */
  ionViewWillEnter(){
    this._events.publish('view:selected', "media");
  }

  
  /**
   * Refresh the view once dragged via ion-refresher
   * @param  {} refresher
   */
  doRefresh(refresher) {
    this._events.publish('refresh:requested', refresher);
  }

}
