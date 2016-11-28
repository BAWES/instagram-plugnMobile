import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';
import { AccountService } from '../../providers/logged-in/account.service';

// Page Imports
import { AccountTabsPage } from '../account/account-tabs/account-tabs';
import { AddAccountPage } from '../add-account/add-account';

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
    ) {
  }

  /**
   * Loads the Instagram account to manage
   */
  loadInstagramAccount(account){
    this.rootPage = AccountTabsPage;
    this.accounts.setActiveAccount(account);
  }

  openPage(page){
    console.log("Attempting to open page");
  }

  openStatisticsPage(pageName: string){
    switch(pageName){
      case "agent-activity":
        this.rootPage = AgentActivityPage;
        break;
      case "media-stats":
        this.rootPage = MediaStatsPage;
        break;
      case "following":
        this.rootPage = FollowingPage;
        break;
      case "followers":
        this.rootPage = FollowersPage;
        break;
    }
    this._menu.close();
  }

  loadAddAccountPage(){
    this.nav.push(AddAccountPage);
    this._menu.close();
  }

  logout(){
    this._auth.logout();
  }

}
