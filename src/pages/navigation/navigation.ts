import { Component } from '@angular/core';

import { AuthService } from '../../providers/auth.service';

import { AccountTabsPage } from '../account/account-tabs/account-tabs';

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

  logout(){
    this._auth.logout();
  }

}
