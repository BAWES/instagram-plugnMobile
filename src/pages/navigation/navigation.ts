import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, ToastController, Events } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { AuthService } from '../../providers/auth.service';
import { ConfigService } from '../../providers/config.service';
import { AccountService } from '../../providers/logged-in/account.service';

// Page Imports
import { AccountTabsPage } from '../account/account-tabs/account-tabs';
import { AddAccountPage } from '../add-account/add-account';
import { InternetOfflinePage } from '../internet-offline/internet-offline';
import { MyActivityPage } from '../my-activity/my-activity';

// Account Stats Pages available on Right Menu
import { AgentActivityPage } from '../statistics/agent-activity/agent-activity';
import { MediaStatsPage } from '../statistics/media-stats/media-stats';
import { FollowingPage } from '../statistics/following/following';
import { FollowersPage } from '../statistics/followers/followers';

@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})
export class NavigationPage {

  rootPage: any = AccountTabsPage;

  private _browser: InAppBrowser;

  @ViewChild('loggedInContent') nav: NavController

  constructor(
    public accounts: AccountService,
    private _auth: AuthService,
    private _menu: MenuController,
    private _toastCtrl: ToastController,
    private _events: Events,
    private _config: ConfigService
    ) {
    // Handle Push Notification Navigation
    this._events.subscribe('notification:grouped', (notificationData) => {
      let data = notificationData;
      this._processNotificationData(data, "grouped");
    });
    this._events.subscribe('notification:single', (notificationData) => {
      let data = notificationData;
      this._processNotificationData(data, "single");
    });

    // Navigate if user has no managed accounts 
    this._events.subscribe("accounts:availability", (availability) => {
      this.rootPage = AddAccountPage;
      if(availability == "available"){
        this.rootPage = AccountTabsPage;
      }
    });

    // Show Offline Page if no Internet
    this._events.subscribe("internet:offline", (availability) => {
      // Switch to offline page 
      this.rootPage = InternetOfflinePage;
      // Show toast that unable to connect
      let toast = this._toastCtrl.create({
        message: 'Unable to connect to Plugn servers.',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    });

  }

  private _processNotificationData(data, type){
    //If managed accounts already loaded, switch to the account belonging to notification
    if(this.accounts.managedAccounts){
      this.accounts.setActiveAccountById(data.user_id);
    }
  }

  /**
   * Loads the Instagram account to manage
   */
  loadInstagramAccount(account){
    this.rootPage = AccountTabsPage;
    this.accounts.setActiveAccount(account);
  }

  /**
   * Load Activity Page showing all activity for the logged in agent
   */
  loadMyActivityPage(){
    this.nav.push(MyActivityPage);
    this._menu.close();
  }

  /**
   * Load Specified Url
   */
  loadUrl(url: string){
    this._browser = new InAppBrowser(url, this._config.browserTarget, this._config.browserOptionsWithCache);
  }

  /**
   * Stats Pages on right nav menu
   */
  openStatisticsPage(pageName: string){
    switch(pageName){
      case "agent-activity":
        this.nav.push(AgentActivityPage);
        break;
      case "media-stats":
        this.nav.push(MediaStatsPage);
        break;
      case "following":
        this.nav.push(FollowingPage);
        break;
      case "followers":
        this.nav.push(FollowersPage);
        break;
    }
    this._menu.close();
  }

  /**
   * Page to add new Instagram account
   */
  loadAddAccountPage(){
    this.nav.push(AddAccountPage);
    this._menu.close();
  }

  /**
   * Log Agent out of the app
   */
  logout(){
    this._auth.logout();
  }

}
