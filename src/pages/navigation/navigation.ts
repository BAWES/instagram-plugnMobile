import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, Events } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';
import { AccountService } from '../../providers/logged-in/account.service';

// Page Imports
import { AccountTabsPage } from '../account/account-tabs/account-tabs';
import { ConversationDetailPage } from '../account/conversation-detail/conversation-detail';
import { AddAccountPage } from '../add-account/add-account';
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

  @ViewChild('loggedInContent') nav: NavController

  constructor(
    public accounts: AccountService,
    private _auth: AuthService,
    private _menu: MenuController,
    private _events: Events
    ) {
    // Handle Push Notification Navigation
    this._events.subscribe('notification:grouped', (notificationData) => {
      let data = notificationData[0];
      this._processNotificationData(data, "grouped");
    });
    this._events.subscribe('notification:single', (notificationData) => {
      let data = notificationData[0];
      this._processNotificationData(data, "single");
    });
  }

  private _processNotificationData(data, type){
    //If managed accounts already loaded, switch to the account belonging to notification 
    if(this.accounts.managedAccounts){
      this.accounts.setActiveAccountById(data.user_id);
    }
    
    // Schedule callback to load account within notification.
    this.accounts.notificationAccountToLoad = data.user_id;

    // The below only if "Single" notification

    // Navigate to conv detail page for this notification
      // this.nav.push(ConversationDetailPage, { 
      //     conversation: notificationData,
      // });
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
    //show support page showing link to open email mailto:

    // Also include some youtube videos explaining how the app works
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
