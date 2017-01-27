import { Component } from '@angular/core';
import { NavController, Events, MenuController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidator } from '../../../validators/custom.validator';

// Models
import { Assignment } from '../../../models/assignment';

// Services
import { AccountService } from '../../../providers/logged-in/account.service';
import { AuthService } from '../../../providers/auth.service';
import { AssignmentService } from '../../../providers/logged-in/assignment.service';
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
  public agentForm: FormGroup;
  // Disable submit button if is loading response from server
  public isLoading = false;

  // Is the current user an admin of this account?
  public isAdmin = false;

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    public auth: AuthService,
    public assignmentService: AssignmentService,
    private _fb: FormBuilder, 
    private _analytics: AnalyticsService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _menuCtrl: MenuController,
    private _alertCtrl: AlertController
    ) {
      this.updateAdminStatus();

      // Initialize the Agent Form
      this.agentForm = this._fb.group({
        email: ["", [Validators.required, CustomValidator.emailValidator]],
      });
    }

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    this._analytics.trackView("Agent Management");

    this.updateAdminStatus();

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
   * Update whether this user is an admin or not 
   */
  updateAdminStatus(){
    if(this.accounts.activeAccount.agent_id == this.auth.agentId){
      this.isAdmin = true;
    }
  }

  /**
   * Attempt to add the agent to account
   */
  onSubmitAgentForm(){
    this.isLoading = true;
    const email = this.agentForm.value.email;

    this.assignmentService
        .assignAgentToAccount(email, this.accounts.activeAccount)
        .subscribe(jsonResponse => {
          this.isLoading = false;
          // Check response for errors?

          // Clear input field on success
        });
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

  showAgentTutorial(){
    let alert = this._alertCtrl.create({
      title: 'How to invite/remove agents?',
      subTitle: `
        Only one admin may manage agent assignments for this account. To become the admin, 
        click on the "Add Account" button available on the main menu then login with Instagram.
        `,
      buttons: ['Ok']
    });
    alert.present();
  }

  showAdminTutorial(){
    let alert = this._alertCtrl.create({
      title: 'How do I make someone else the Admin?',
      subTitle: `Only one admin may manage agent assignments for this account. You may pass on your 
      admin rights to someone else by having them click on "Add Account" on the main navigation menu 
      and authenticating with Instagram.`,
      buttons: ['Ok']
    });
    alert.present();
  }
  

}