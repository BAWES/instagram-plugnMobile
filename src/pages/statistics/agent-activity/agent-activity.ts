import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';
import { ActivityService } from '../../../providers/logged-in/activity.service';

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

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    public activityService: ActivityService,
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    // Load and populate media detail
    this._loadAgentActivity();
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