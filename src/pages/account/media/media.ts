import { Component } from '@angular/core';
import { NavController, Events, MenuController } from 'ionic-angular';

import { MediaService } from '../../../providers/logged-in/media.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

// Pages
import { MediaDetailPage } from '../media-detail/media-detail';

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
    private _backBtn: HardwareBackButtonService,
    private _menuCtrl: MenuController
    ) {}

  ionViewDidLoad() {
    // Initialize Class Here If Needed
  }

  ionViewDidEnter() {
    // Setup Back Button Behavior
    this._backBtn.toggleMenuOnBack();
    // Enable Swipe on Right Menu
    this._menuCtrl.swipeEnable(true, "right");
  }

  /**
   * Trigger an event notifying that user is opening this page
   */
  ionViewWillEnter(){
    this._events.publish('view:selected', "media");
  }

  /**
   * Load Media Detail Page
   * @param  {} mediaItem
   */
  loadMediaDetail(mediaItem){
      this.navCtrl.push(MediaDetailPage, { 
        media: mediaItem
      });
  }

  
  /**
   * Refresh the view once dragged via ion-refresher
   * @param  {} refresher
   */
  doRefresh(refresher) {
    this._events.publish('refresh:requested', refresher);
  }

}
