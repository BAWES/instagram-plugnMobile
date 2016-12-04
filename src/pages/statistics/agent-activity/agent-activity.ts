import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';
import { ActivityService } from '../../../providers/logged-in/activity.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

/*
  Agent Activity Statistics Page
*/
@Component({
  selector: 'page-agent-activity',
  templateUrl: 'agent-activity.html'
})
export class AgentActivityPage {

  public isLoading = true;
  public accountActivity; // Loaded activity data

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    public activityService: ActivityService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    // Load and populate media detail
    this._loadAgentActivity();

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
    });

    // Subscribe to Pop this page off on account change
    this._events.subscribe("account:switching", this._accountSwitchHandler = (eventData) => {
      this.navCtrl.popToRoot();
    });
  }
  /**
   * Page is leaving
   */
  ionViewWillLeave(){
    // Unsubscribe
    this._events.unsubscribe("account:switching", this._accountSwitchHandler);
  }


  /**
   * Load Agent Activity for the currently active account
   */
  private _loadAgentActivity(){
    this.isLoading = true;
    this.activityService
        .getActivityOnAccount(this.accounts.activeAccount.user_id)
        .subscribe(jsonResponse => {
          this.isLoading = false;
          this.accountActivity = jsonResponse;
        });
  }
  

}