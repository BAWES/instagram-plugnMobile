import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { AuthService } from '../../providers/auth.service';
import { ConfigService } from '../../providers/config.service';
import { AnalyticsService } from '../../providers/analytics.service';
import { AgentService } from '../../providers/logged-in/agent.service';

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

  private _browser: InAppBrowser;

  constructor(
    public navCtrl: NavController, 
    public auth: AuthService,
    private _agentService: AgentService,
    private _analytics: AnalyticsService,
    private _config: ConfigService
    ) {}

  ionViewDidEnter() {
    this._analytics.trackView("Add Account Page");
    
    // Load the profile which helps us decide what content to show user.
    this._loadProfile();
  }

  /**
   * Load the agents profile
   */
  private _loadProfile(){
    this._agentService.getProfile().subscribe(profileData => {
      this.profile = profileData;
    });
  }

  /**
   * Load Specified Url
   */
  loadUrl(url: string){
    this._browser = new InAppBrowser(url, this._config.browserTarget, this._config.browserOptionsWithCache);
  }

  /**
   * Tests if logged in agent is allowed to add more Instagram accounts (as admin)
   * If not, display message with button to load billing portal or cancel.
   */
  public isUserAllowedToAddAccount(): boolean{
    // If Trial is active. Allow them to add Instagram account
    if(this.profile.trial.isActive){
      // this._loadInstagramPortal(authKey);
      return true;
    }

    // If Billing is Active and he hit the account limit
    if(this.profile.billing.isActive && (this.profile.numberOfOwnedAccounts >= this.profile.ownedAccountLimit)){
      // Tell that they've hit the account limit. Need to upgrade plan!
      // Button to load Billing Portal
      return false;
    }

    // No Billing + No Trial
    if(!this.profile.billing.isActive){
      // Tell to set up billing to add accounts 
      // Button to load Billing Portal
      return false;
    }

    // If Billing is Active and didn't face any issues from above checks, allow to add account
    if(this.profile.trial.isActive){
      return true;
    }

    return false;
  }

}
