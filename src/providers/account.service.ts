import { Injectable } from '@angular/core';

import { Platform } from 'ionic-angular';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Instagram Accounts Assigned to Agent
*/
@Injectable()
export class AccountService {

  accountEndpoint: string = "/accounts";

  constructor(
    private _authhttp: AuthHttpService,
    private _platform: Platform
    ) {
    _platform.ready().then(() => {
      // Get list of accounts managed by the currently logged in agent 
      this.getManagedAccounts();
    });
  }

  getManagedAccounts(){
    this._authhttp.get(this.accountEndpoint).subscribe(jsonResponse => {
      console.log(jsonResponse);
    });
  }


}
