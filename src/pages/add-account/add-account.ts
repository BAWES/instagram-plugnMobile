import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { AuthService } from '../../providers/auth.service';
import { ConfigService } from '../../providers/config.service';
import { AnalyticsService } from '../../providers/analytics.service';
import { AgentService } from '../../providers/logged-in/agent.service';
import { AccountService } from '../../providers/logged-in/account.service';

/*
  Class for the add-account page.
*/
@Component({
  selector: 'page-add-account',
  templateUrl: 'add-account.html'
})
export class AddAccountPage {

  // Agent Profile Loaded via API
  public profile: any;
  public profileLoading: boolean = false;

  private _onAccountAddedFn;

  constructor(
    public navCtrl: NavController, 
    public auth: AuthService,
    private _accounts: AccountService,
    private _events: Events,
    private _agentService: AgentService,
    private _analytics: AnalyticsService,
    private _config: ConfigService
    ) {
      this._onAccountAddedFn = () => {
        this.navCtrl.pop();

        // Refresh Account List
        this._accounts.refreshManagedAccounts(false);
      }
    }

  ionViewDidEnter() {
    this._analytics.trackView("Add Account Page");

    // Leave page when account is added
    this._events.subscribe("accountAdded", this._onAccountAddedFn);
    
    // Load the profile which helps us decide what content to show user.
    this._loadProfile();
  }
  ionViewWillLeave(){
    this._events.unsubscribe("accountAdded", this._onAccountAddedFn);
  }

  /**
   * Load the agents profile
   */
  private _loadProfile(){
    this.profileLoading = true;
    this._agentService.getProfile().subscribe(profileData => {
      this.profileLoading = false;
      this.profile = profileData;
    });
  }

  /**
   * Request to load of the billing portal
   */
  public requestBillingPortal(){
    this._events.publish("admin:loadPortal", 'billing');
  }

  /**
   * Request to load of the Instagram portal
   */
  public requestInstagramPortal(){
    this._events.publish("admin:loadPortal", 'instagram');
  }

  /**
   * Tests if logged in agent is allowed to add more Instagram accounts (as admin)
   */
  public isUserAllowedToAddAccount(): boolean{
    // If Trial is active
    if(this.profile.trial.isActive){
      return true;
    }

    // If Billing is Active and he hit the account limit
    if(this.profile.billing.isActive && 
      (this.profile.numberOfOwnedAccounts >= this.profile.ownedAccountLimit)){
      return false;
    }

    // No Billing + No Trial
    if(!this.profile.billing.isActive){
      return false;
    }

    // If Billing is Active and didn't face any issues from above checks, allow to add account
    if(this.profile.billing.isActive){
      return true;
    }

    return false;
  }

}
