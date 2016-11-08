import { Injectable } from '@angular/core';

import { Platform } from 'ionic-angular';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Instagram Accounts Assigned to Agent
*/
@Injectable()
export class AccountService {

  public activeAccount; // The account currently being viewed by agent
  public managedAccounts; // Array of managed accounts stored here

  private _accountEndpoint: string = "/accounts";

  constructor(
    private _authhttp: AuthHttpService,
    private _platform: Platform
    ) {
    _platform.ready().then(() => {
      // Get list of accounts managed by the currently logged in agent 
      this._populateManagedAccounts();
    });
  }

  /**
   * Get updated list of accounts managed by agent and store in variable
   */
  private _populateManagedAccounts(){
    this._authhttp.get(this._accountEndpoint).subscribe(jsonResponse => {
      this.managedAccounts = jsonResponse;

      // Sets the currently active account for initial viewing (if exists)
      if(!this.activeAccount && this.managedAccounts[0]){
        this.activeAccount = this.managedAccounts[0];
      }
    });
  }


}
