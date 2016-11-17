import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';
import { AccountService } from '../../providers/logged-in/account.service';

// Page Imports
import { AccountTabsPage } from '../account/account-tabs/account-tabs';
import { AddAccountPage } from '../add-account/add-account';

@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})
export class NavigationPage {

  rootPage: any = AccountTabsPage;

  constructor(
    public accounts: AccountService,
    private _auth: AuthService,
    private _menu: MenuController,
    ) {
  }

  openPage(page){
    console.log("Attempting to open page");
  }

  loadAddAccountPage(){
    this.rootPage = AddAccountPage;
    this._menu.close();
  }

  logout(){
    this._auth.logout();
  }

}
