import { Component } from '@angular/core';
import { NavController, Events, MenuController } from 'ionic-angular';

import { MediaService } from '../../../providers/logged-in/media.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';
import { AnalyticsService } from '../../../providers/analytics.service';

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
    private _analytics: AnalyticsService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _menuCtrl: MenuController,
    ) {}

  ionViewDidEnter() {
    this._analytics.trackView("Media List");

    // Setup Back Button Behavior
    this._backBtn.toggleMenuOnBack();
    // Enable Swipe on Right Menu
    this._menuCtrl.swipeEnable(true, "right");

    // Request Refresh Content If Required
    this.accounts.refreshContentIfRequired();
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

  /**
   * Load Specified Url
   */
  loadUrl(page: string){
    if(page == "instagram"){
      this._events.publish("admin:loadPortal", 'instagram');
    }else if(page == 'billing'){
      this._events.publish("admin:loadPortal", 'billing');
    }
  }

}
