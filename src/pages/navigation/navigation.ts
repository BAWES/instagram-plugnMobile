import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, Platform } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';
import { AccountService } from '../../providers/logged-in/account.service';

// Page Imports
import { AccountTabsPage } from '../account/account-tabs/account-tabs';
import { AddAccountPage } from '../add-account/add-account';
import { MyActivityPage } from '../my-activity/my-activity';

// Account Stats Pages available on Right Menu
import { AgentActivityPage } from '../statistics/agent-activity/agent-activity';
import { MediaStatsPage } from '../statistics/media-stats/media-stats';
import { FollowingPage } from '../statistics/following/following';
import { FollowersPage } from '../statistics/followers/followers';

declare var intercom: any;
@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})
export class NavigationPage {

  rootPage: any = AccountTabsPage;

  cordovaAvailable:boolean = false;
  intercomUnreadMessages: number = 0;
  private _intercomRefreshTimer;

  @ViewChild('loggedInContent') nav: NavController

  constructor(
    public accounts: AccountService,
    private _auth: AuthService,
    private _menu: MenuController,
    private _platform: Platform
    ) {
      if(_platform.is("cordova")){
        this.cordovaAvailable = true;
        this.intercomUnreadMessages = intercom.unreadConversationCount();
        this._initIntercomRefresher();
      }
  }

  /**
   * Initialize the comment content refresher
   */
  private _initIntercomRefresher(){
    // Refresh Comments every X Seconds
    let numSeconds = 20 * 1000;
    this._intercomRefreshTimer = setInterval(() => {
      this.intercomUnreadMessages = intercom.unreadConversationCount();
    }, numSeconds);
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
   * Load Intercom support
   */
  offerSupport(){
    intercom.displayMessenger();
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
