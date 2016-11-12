import { Injectable } from '@angular/core';

import { Platform, Events } from 'ionic-angular';

// Models
import { InstagramAccount } from '../../models/instagram-account';

// Services
import { AuthHttpService } from './authhttp.service';
import { MediaService } from './media.service';
import { ConversationService } from './conversation.service';

/*
  Manages Instagram Accounts Assigned to Agent
*/
@Injectable()
export class AccountService {

  public activeAccount: InstagramAccount; // The account currently being viewed by agent
  public managedAccounts: InstagramAccount[]; // Array of managed accounts stored here

  /**
   * Whether the user is currently using "media" or "conversation" view
   * This will let the system know which data takes priority to load first from server
   */
  public currentView = "media";

  public isLoading = false;

  private _accountEndpoint: string = "/accounts";

  constructor(
    private _platform: Platform,
    private _events: Events,
    private _authhttp: AuthHttpService,
    private _media: MediaService,
    private _conversation: ConversationService,
    ) {
    _platform.ready().then(() => {
      // Get list of accounts managed by the currently logged in agent 
      this._populateManagedAccounts();
    });

    // Set current view when triggered
    // This is to know which HTTP request takes priority (reduce perceived loading time)
    this._events.subscribe('view:selected', (selectedView) => {
      this.currentView = selectedView[0];
    });

    // Reload Updated Media and Conversations on Refresh Request by User 
    this._events.subscribe('refresh:requested', (refresherData) => {
      let refresher = refresherData[0];
      this.loadAccountMediaAndConversations(refresher);
    });
  }

  /**
   * Sets the currently active account to the one passed as param
   * then publishes event `account:selected`
   * @param  {any} account
   */
  public setActiveAccount(account){
    this.activeAccount = account;
    this.loadAccountMediaAndConversations();
  }

  /**
   * Attempt to load media and conversations for current active account
   * based on set priority/view.
   * 
   * If a Refresher is provided, do not trigger isLoading animation.
   * 
   * @param  {} refresher? The ionic refresher to complete if its used
   */
  loadAccountMediaAndConversations(refresher?){
    if(!this.activeAccount) return;

    // Loading priority is based on the active view 
    if(this.currentView == "media"){
      // Load Media > Follow up by Loading Conversations as Callback
      this._media.loadMediaForAccount(this.activeAccount, () => {
        if(refresher){
          refresher.complete();
        }
        this._conversation.loadConversationsForAccount(this.activeAccount);
      }, 
      refresher? true: false);
    }else if(this.currentView == "conversation"){
      // Load Conversations > Follow up by Loading Media as Callback
      this._conversation.loadConversationsForAccount(this.activeAccount, () => {
        if(refresher){
          refresher.complete();
        }
        this._media.loadMediaForAccount(this.activeAccount);
      }, 
      refresher? true: false);
    }
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


}
