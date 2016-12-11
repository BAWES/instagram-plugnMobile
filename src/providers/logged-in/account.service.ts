import { Injectable } from '@angular/core';

import { Platform, Events } from 'ionic-angular';

// Models
import { InstagramAccount } from '../../models/instagram-account';
import { StatsRecord } from '../../models/stats-record';

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

  public activeAccountStats:StatsRecord[]; // Stats belonging to the active account
  // Storing arrays for graphing of historical data
  public statsDatesArray = [];
  public statsFollowingArray = [];
  public statsFollowersArray = [];
  public statsMediaArray = [];

  /**
   * Whether the user is currently using "media" or "conversation" view
   * This will let the system know which data takes priority to load first from server
   */
  public currentView = "conversation";

  public isLoading = false;
  public statsLoading = false;

  private _accountEndpoint: string = "/accounts";

  // Interval Refresh Timer
  private _refreshTimerAccounts;
  private _refreshTimerMedia;

  // Notifications: Account to load when managed accounts populated
  public notificationAccountToLoad;

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
      this._initAccountsRefresher();
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

    // On Logout Event, destroy refresh timers
    this._events.subscribe('user:logout', (userEventData) => {
      this.destroyAccountsRefresher();
      this.destroyMediaRefresher();
    });
  }

  /**
   * Loads lifetime stats belonging to this account
   * if not already loaded
   */
  public loadAccountStats(){
    // Return if already loaded
    if(this.activeAccountStats){
      return;
    }

    // Otherwise load the stats
    this.statsLoading = true;
    let statsUrl = `${this._accountEndpoint}/stats?accountId=${this.activeAccount.user_id}`;
    this._authhttp.get(statsUrl).subscribe(jsonResp => {
      this.activeAccountStats = jsonResp;
      // Populate data for graphing (push to front of array for chronological graphing)
      for (var i = 0; i < this.activeAccountStats.length; i++) {
        this.statsDatesArray.unshift(this.activeAccountStats[i].record_date);
        this.statsFollowersArray.unshift(this.activeAccountStats[i].record_follower_count);
        this.statsFollowingArray.unshift(this.activeAccountStats[i].record_following_count);
        this.statsMediaArray.unshift(this.activeAccountStats[i].record_media_count);
      }

      this.statsLoading = false;
      this.activeAccountStats = jsonResp;

      this._events.publish("chartdata:ready");
    });
  }

  /**
   * Sets active account based on account id
   */
  public setActiveAccountById(accountId: number){
    // If active account has account id then do nothing
    if(this.activeAccount.user_id == accountId){
      return;
    }

    // Find the account id and switch to it 
    this.managedAccounts.forEach(account => {
      if(account.user_id == accountId){
        this.setActiveAccount(account);
        return;
      }
    });
  }

  /**
   * Sets the currently active account to the one passed as param
   * then publishes event `account:selected`
   * @param  {any} account
   */
  public setActiveAccount(account){
    // Do nothing if this account is already loaded
    if(this.activeAccount == account) return;

    // Publish an Event that we're switching accounts
    this._events.publish("account:switching", account);

    // Proceed with switching accounts
    this.activeAccount = account;
    // reset stats
    this.activeAccountStats = null;
    this.statsDatesArray = [];
    this.statsFollowersArray = [];
    this.statsFollowingArray = [];
    this.statsMediaArray = [];

    // Destroy Media refresher
    this.destroyMediaRefresher();

    // Load
    this.loadAccountMediaAndConversations();

    // Enable Media Refresher
    this._initMediaConversationsRefresher();
  }

  /**
   * Attempt to load media and conversations for current active account
   * based on set priority/view.
   * 
   * If a Refresher is provided, do not trigger isLoading animation.
   * 
   * @param  {} refresher? The ionic refresher to complete if its used
   */
  loadAccountMediaAndConversations(refresher?, showLoading = true){
    if(!this.activeAccount) return;

    // Loading priority is based on the active view 
    if(this.currentView == "media"){
      // Load Media > Follow up by Loading Conversations as Callback
      this._media.loadMediaForAccount(this.activeAccount, () => {
        if(refresher){
          refresher.complete();
        }
        this._conversation.loadConversationsForAccount(this.activeAccount, false, false, showLoading);
      }, 
      refresher? true: false, showLoading);
    }else if(this.currentView == "conversation"){
      // Load Conversations > Follow up by Loading Media as Callback
      this._conversation.loadConversationsForAccount(this.activeAccount, () => {
        if(refresher){
          refresher.complete();
        }
        this._media.loadMediaForAccount(this.activeAccount, false, false, showLoading);
      }, 
      refresher? true: false, showLoading);
    }
  }

  /**
   * Get updated list of accounts managed by agent and store in variable
   */
  private _populateManagedAccounts(showLoading = true){
    if(showLoading){
      this.isLoading = true;
    }

    this._authhttp.get(this._accountEndpoint).subscribe(jsonResponse => {
      this.isLoading = false;
      this.managedAccounts = jsonResponse;

      if(!this.activeAccount && this.managedAccounts[0]){
        // Sets the currently active account for initial viewing (if exists)
        this.setActiveAccount(this.managedAccounts[0]);
      }

      // If notification callback available, do that. Otherwise set default
      if(this.notificationAccountToLoad){
        this.notificationAccountToLoad = null;
        this.setActiveAccountById(this.notificationAccountToLoad);
      }
    });
  }

  /**
   * Initialize the Account List refresher
   */
  private _initAccountsRefresher(){
    // Refresh Comments every X Seconds
    let numSeconds = 20 * 1000;
    this._refreshTimerAccounts = setInterval(() => {
      this._populateManagedAccounts(false);
    }, numSeconds);
  }
  public destroyAccountsRefresher(){
    if(this._refreshTimerMedia){
      clearInterval(this._refreshTimerAccounts);
    }
  }

  /**
   * Initialize the Media and Conversation List refresher
   */
  private _initMediaConversationsRefresher(){
    // Refresh Comments every X Seconds
    let numSeconds = 20 * 1000;
    this._refreshTimerMedia = setInterval(() => {
      // Reload media and conversations 
      this.loadAccountMediaAndConversations(false, false);
    }, numSeconds);
  }
  public destroyMediaRefresher(){
    if(this._refreshTimerMedia){
      clearInterval(this._refreshTimerMedia);
    }
  }


}
