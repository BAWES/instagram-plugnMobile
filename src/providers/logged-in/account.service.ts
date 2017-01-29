import { Injectable, NgZone } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
// Models
import { InstagramAccount } from '../../models/instagram-account';
import { StatsRecord } from '../../models/stats-record';

// Services
import { AuthService } from '../auth.service';
import { AuthHttpService } from './authhttp.service';
import { MediaService } from './media.service';
import { ConversationService } from './conversation.service';

/*
  Manages Instagram Accounts Assigned to Agent
*/
@Injectable()
export class AccountService {

  public activeAccount: InstagramAccount; // The account currently being viewed by agent
  public isActiveAccountAdmin: boolean = false; // Whether the logged in agent is admin of activeAccount
  public managedAccounts: InstagramAccount[]; // Array of managed accounts stored here

  public contentNeedsRefresh:boolean = false;

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
  private _ownedAccountEndpoint: string = "/owned-accounts";

  // Interval Refresh Timer
  private _refreshTimerAccounts;
  private _refreshTimerMedia;

  private _areTimersActivated = false;

  constructor(
    private _platform: Platform,
    private _events: Events,
    private _auth: AuthService,
    private _authhttp: AuthHttpService,
    private _media: MediaService,
    private _conversation: ConversationService,
    private _zone: NgZone
    ) {
    _platform.ready().then(() => {
      this._initialize();
    });

    // Set current view when triggered
    // This is to know which HTTP request takes priority (reduce perceived loading time)
    this._events.subscribe('view:selected', (selectedView) => {
      this.currentView = selectedView;
    });

    // Reload Updated Media and Conversations on Refresh Request by User
    this._events.subscribe('refresh:requested', (refresherData) => {
      let refresher = refresherData;
      this.loadAccountMediaAndConversations(refresher);
    });

    // On Login Event, Get list of accounts managed by the currently logged in agent
    this._events.subscribe('user:login', (userEventData) => {
       this._initialize();
    });

    // On Account assignment removed, refresh managed and active accounts
    this._events.subscribe('accountAssignment:removed', (userEventData) => {
      this._destroy();
      this._initialize();
    });

    // On Logout Event, destroy refresh timers
    this._events.subscribe('user:logout', (userEventData) => {
      this._destroy();
    });

    // On Offline destroy
    this._events.subscribe('internet:offline', (userEventData) => {
      this._destroy();
    });
  }

  /**
   * Initialize
   */
  private _initialize(){
    if(!this._areTimersActivated){
      this.refreshManagedAccounts();
      this._initAccountsRefresher();
      this._areTimersActivated = true;
    }
  }
  /**
   * Destroy
   */
  private _destroy(){
    this.destroyAccountsRefresher();
    this.destroyMediaRefresher();
    this._areTimersActivated = false;
    this.activeAccount = null;
    this.managedAccounts = null;
  }

  /**
   * Update whether this user is an admin or not 
   */
  private _updateAdminStatus(){
    if(this._auth.agentId && this.activeAccount && 
      (this.activeAccount.agent_id == this._auth.agentId)){
      this.isActiveAccountAdmin = true;
    }else this.isActiveAccountAdmin = false;
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
    this._zone.run(() => {
      // Running in Zone because iOS doesnt show loading / needs manual change detection trigger
      this.managedAccounts.forEach(account => {
        if(account.user_id == accountId){
          this.setActiveAccount(account);
          return;
        }
      });
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
    // Update Admin Status
    this._updateAdminStatus();
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
   * Refreshes content if set as required
   */
  public refreshContentIfRequired(){
    if(this.contentNeedsRefresh){
      this.contentNeedsRefresh = false;
      this.loadAccountMediaAndConversations(null, false);
    }
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
  public refreshManagedAccounts(showLoading = true){
    if(showLoading){
      this.isLoading = true;
    }

    this._authhttp.get(this._accountEndpoint).subscribe(jsonResponse => {
      this.isLoading = false;
      this.managedAccounts = jsonResponse;

      if(!showLoading && this.activeAccount){
        // On account refresh, update the sidebar data for currently active account
        for(let i=0; i < this.managedAccounts.length; i++){
          if(this.managedAccounts[i].user_id == this.activeAccount.user_id){
            this.activeAccount.user_follower_count = this.managedAccounts[i].user_follower_count;
            this.activeAccount.user_following_count = this.managedAccounts[i].user_following_count;
            this.activeAccount.user_media_count = this.managedAccounts[i].user_media_count;
            this.activeAccount.lastAgentActivity = this.managedAccounts[i].lastAgentActivity;
            this.activeAccount.assignments = this.managedAccounts[i].assignments;
            break;
          }
        }
      }

      // Load whatever account available (if any)
      this._loadAvailableAccount();

    });
  }


  // Loads whatever available account by broadcasting availability.
  private _loadAvailableAccount(){
    // What to do if theres no active account yet?
    if(!this.activeAccount){
      // Sets the managed account as active account for initial viewing (if exists)
      // Based on which has the most unhandled comments.
      if(this.managedAccounts && this.managedAccounts[0]){
        let accountNeeded = this.managedAccounts[0];
        this.managedAccounts.forEach(account => {
          // Load the account with the most comments unhandled
          if(account.unhandledCount > accountNeeded.unhandledCount){
            accountNeeded = account;
          }
        });
        this.setActiveAccount(accountNeeded);
        this._events.publish("accounts:availability", "available");
      }else{
        // Publish an Event that we have no accounts
        this._events.publish("accounts:availability", "none");
      }
    }
  }

  /**
   * Initialize the Account List refresher
   */
  private _initAccountsRefresher(){
    // Refresh Comments every X Seconds
    let numSeconds = 20 * 1000;
    this._refreshTimerAccounts = setInterval(() => {
      this.refreshManagedAccounts(false);
    }, numSeconds);
  }
  public destroyAccountsRefresher(){
    if(this._refreshTimerAccounts){
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


  /**
   * Removes the currently logged in agent from being the admin
   * of the passed Instagram account
   */
  public removeAccountOwnership(accountId: number): Observable<any>{
    let url = `${this._ownedAccountEndpoint}?accountId=${accountId}`;
    
    return this._authhttp.delete(url);
  }


}
