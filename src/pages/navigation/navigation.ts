import { Component } from '@angular/core';

import { AuthService } from '../../providers/auth.service';

// Page Imports
import { AccountTabsPage } from '../account/account-tabs/account-tabs';
import { AddAccountPage } from '../add-account/add-account';

@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})
export class NavigationPage {

  rootPage: any = AccountTabsPage;

  constructor(private _auth: AuthService) {

  }

  openPage(page){
    console.log("Attempting to open page");
  }

  loadAddAccountPage(){
    this.rootPage = AddAccountPage;
  }

  logout(){
    this._auth.logout();
  }

}
