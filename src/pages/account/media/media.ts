import { Component } from '@angular/core';
import { NavController, Events, MenuController } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { MediaService } from '../../../providers/logged-in/media.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';
import { AnalyticsService } from '../../../providers/analytics.service';
import { AuthService } from '../../../providers/auth.service';
import { ConfigService } from '../../../providers/config.service';

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
  public isAdmin: boolean = false;
  private _browser: InAppBrowser;

  constructor(
    public navCtrl: NavController, 
    public media: MediaService,
    public accounts: AccountService,
    public auth: AuthService,
    private _analytics: AnalyticsService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _menuCtrl: MenuController,
    private _config: ConfigService
    ) {
      this.updateAdminStatus();
    }

  ionViewDidEnter() {
    this._analytics.trackView("Media List");
    this.updateAdminStatus();

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
   * Update whether this user is an admin or not 
   */
  updateAdminStatus(){
    if(this.auth.agentId && this.accounts.activeAccount && 
      (this.accounts.activeAccount.agent_id == this.auth.agentId)){
      this.isAdmin = true;
    }
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
  loadUrl(url: string){
    this._browser = new InAppBrowser(url, this._config.browserTarget, this._config.browserOptionsWithCache);
  }

}
