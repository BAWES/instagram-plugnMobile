import { Injectable } from '@angular/core';

import { Platform, Events } from 'ionic-angular';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Instagram Accounts Assigned to Agent
*/
@Injectable()
export class AccountService {

  public activeAccount; // The account currently being viewed by agent
  public managedAccounts; // Array of managed accounts stored here

  public isLoading = true;

  private _accountEndpoint: string = "/accounts";

  constructor(
    private _authhttp: AuthHttpService,
    private _platform: Platform,
    private _events: Events
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
    this.isLoading = true;
    
    this._authhttp.get(this._accountEndpoint).subscribe(jsonResponse => {
      this.isLoading = false;
      this.managedAccounts = jsonResponse;

      // Sets the currently active account for initial viewing (if exists)
      if(!this.activeAccount && this.managedAccounts[0]){
        this.setActiveAccount(this.managedAccounts[0]);
      }
    });
  }

  /**
   * Sets the currently active account to the one passed as param
   * then publishes event `account:selected`
   * @param  {any} account
   */
  public setActiveAccount(account){
    this.activeAccount = account;
    this._events.publish('account:selected', account);
  }


}
