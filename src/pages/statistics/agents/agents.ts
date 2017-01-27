import { Component } from '@angular/core';
import { NavController, Events, MenuController, AlertController } from 'ionic-angular';

// Models
import { Assignment } from '../../../models/assignment';

// Services
import { AccountService } from '../../../providers/logged-in/account.service';
import { AuthService } from '../../../providers/auth.service';
import { ActivityService } from '../../../providers/logged-in/activity.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';
import { AnalyticsService } from '../../../providers/analytics.service';

/*
  Agent Activity Statistics Page
*/
@Component({
  selector: 'page-agents',
  templateUrl: 'agents.html'
})
export class AgentsPage {

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    public auth: AuthService,
    private _analytics: AnalyticsService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _menuCtrl: MenuController,
    private _alertCtrl: AlertController
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    this._analytics.trackView("Agent Management");

    // Disable Swipe on Right Menu
    this._menuCtrl.swipeEnable(false, "right");

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
      this._backBtn.toggleMenuOnBack();
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
    // Enable Swipe on Right Menu
    this._menuCtrl.swipeEnable(true, "right");
  }


  /**
   * Remove the assignment as requested
   */
  removeAssignment(assignment: Assignment){
    // Show confirm dialog before proceeding with removal
    let confirm = this._alertCtrl.create({
      title: 'Remove '+assignment.email+'?',
      message: 'Once removed they will lose access to @'+this.accounts.activeAccount.user_name,
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Remove',
          handler: () => {
            console.log('remove clicked');
          }
        }
      ]
    });
    confirm.present();
  }
  

}