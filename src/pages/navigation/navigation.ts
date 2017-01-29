import { Component, ViewChild } from '@angular/core';
import { MenuController, NavController, ToastController, Events, AlertController, LoadingController } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { AuthService } from '../../providers/auth.service';
import { ConfigService } from '../../providers/config.service';
import { AccountService } from '../../providers/logged-in/account.service';
import { AgentService } from '../../providers/logged-in/agent.service';

// Page Imports
import { AccountTabsPage } from '../account/account-tabs/account-tabs';
import { AddAccountPage } from '../add-account/add-account';
import { InternetOfflinePage } from '../internet-offline/internet-offline';
import { MyActivityPage } from '../my-activity/my-activity';

// Account Stats Pages available on Right Menu
import { AgentActivityPage } from '../statistics/agent-activity/agent-activity';
import { AgentsPage } from '../statistics/agents/agents';
import { MediaStatsPage } from '../statistics/media-stats/media-stats';
import { FollowingPage } from '../statistics/following/following';
import { FollowersPage } from '../statistics/followers/followers';

@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})
export class NavigationPage {

  rootPage: any = AccountTabsPage;

  private _browser: InAppBrowser;
  private _browserLoadEvents;
  private _browserCloseEvents;

  @ViewChild('loggedInContent') nav: NavController

  constructor(
    public accounts: AccountService,
    private _auth: AuthService,
    private _agentService: AgentService,
    private _menu: MenuController,
    private _alertCtrl: AlertController,
    private _loadingCtrl: LoadingController,
    private _toastCtrl: ToastController,
    private _events: Events,
    private _config: ConfigService
    ) {
    // Handle Push Notification Navigation
    this._events.subscribe('notification:grouped', (notificationData) => {
      let data = notificationData;
      this._processNotificationData(data, "grouped");
    });
    this._events.subscribe('notification:single', (notificationData) => {
      let data = notificationData;
      this._processNotificationData(data, "single");
    });

    // Navigate if user has no managed accounts 
    this._events.subscribe("accounts:availability", (availability) => {
      this.rootPage = AddAccountPage;
      if(availability == "available"){
        this.rootPage = AccountTabsPage;
      }
    });

    // Load Billing or IG page as requested
    this._events.subscribe("admin:loadPortal", (portal) => {
      if(portal == "billing"){
        this.getAuthKeyThenLoadPage('billing');
      }else if(portal == 'instagram'){
        this.getAuthKeyThenLoadPage('instagram');
      }
    });

    // Show Offline Page if no Internet
    this._events.subscribe("internet:offline", (availability) => {
      // Switch to offline page 
      this.rootPage = InternetOfflinePage;
      // Show toast that unable to connect
      let toast = this._toastCtrl.create({
        message: 'Unable to connect to Plugn servers.',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    });

  }

  private _processNotificationData(data, type){
    //If managed accounts already loaded, switch to the account belonging to notification
    if(this.accounts.managedAccounts){
      this.accounts.setActiveAccountById(data.user_id);
    }
  }

  /**
   * Loads the Instagram account to manage
   */
  loadInstagramAccount(account){
    this.rootPage = AccountTabsPage;
    this.accounts.setActiveAccount(account);
  }

  /**
   * Load Activity Page showing all activity for the logged in agent
   */
  loadMyActivityPage(){
    this.nav.push(MyActivityPage);
    this._menu.close();
  }

  /**
   * Stats Pages on right nav menu
   */
  openStatisticsPage(pageName: string){
    switch(pageName){
      case "agent-activity":
        this.nav.push(AgentActivityPage);
        break;
      case "agents":
        this.nav.push(AgentsPage);
        break;
      case "media-stats":
        this.nav.push(MediaStatsPage);
        break;
      case "following":
        this.nav.push(FollowingPage);
        break;
      case "followers":
        this.nav.push(FollowersPage);
        break;
    }
    this._menu.close();
  }

  /**
   * Page to add new Instagram account
   */
  loadAddAccountPage(){
    this.nav.push(AddAccountPage);
    this._menu.close();
  }

  /**
   * Log Agent out of the app
   */
  logout(){
    this._auth.logout();
  }

  /**
   * Opens the provided agent page in the browser using the auth key
   */
  getAuthKeyThenLoadPage(page: string = "billing"){
    // Show Loading 
    let loading = this._loadingCtrl.create({
      spinner: 'crescent',
      content: 'Loading..'
    });
    loading.present();

    // Get an Auth key
    this._agentService.generateAuthKey().subscribe(authKey => {
      loading.dismiss();
      
      if(page == "billing"){
        this._loadBillingPortal(authKey);
      }else if(page == "instagram"){
        this._loadInstagramPortal(authKey);
      }
    });
  }

  /**
   * Loads the Instagram portal in browser with the auth key provided
   * The portal enables user to add a new IG account
   */
  private _loadInstagramPortal(authKey: string){
    // Load in app browser to Instagram portal with Authkey
    let instagramPortalUrl = `${this._config.agentBaseUrl}/instagram/${authKey}`;
    this.loadUrl(instagramPortalUrl, true);
  }

  /**
   * Loads the billing portal in browser with the auth key provided
   */
  private _loadBillingPortal(authKey: string){
    // Load in app browser to billing portal with Authkey
    let billingUrl = `${this._config.agentBaseUrl}/billing/${authKey}`;
    this.loadUrl(billingUrl);
  }

  /**
   * Load Specified Url
   */
  loadUrl(url: string, trackActionsOnUrl:boolean = false){
    this._browser = new InAppBrowser(url, this._config.browserTarget, this._config.browserOptionsWithCache);

    // Close browser on Instagram account successfully added.
    if(trackActionsOnUrl){
      // Keep track of urls loaded
      this._browserLoadEvents = this._browser.on("loadstop");
      this._browserLoadEvents = this._browserLoadEvents.map(res => res.url).subscribe(url => {
        this._doActionBasedOnUrl(url);
      });

      // Keep track of browser if closed
      this._browserCloseEvents = this._browser.on("exit").first().subscribe(resp => {
        // Browser closed, unsubscribe from previous observables
        this._browserLoadEvents.unsubscribe();
        this._browserCloseEvents.unsubscribe();
      });
    }
  }

  /**
   * Parse url input, then do action based on that input
   * This function takes the access token from server response
   *
   * @param {string} url
   */
  private _doActionBasedOnUrl(url: string){

    // If Instagram Account Added Succesfully, Close the Browser Window
    if(url.indexOf("?responseType=success") !== -1){
      this._browser.close();
      // Show Alert with success message
      let alert = this._alertCtrl.create({
        subTitle: 'Your Instagram account is now linked to Plugn',
        buttons: ['Great!']
      });
      alert.present();
    }
  }

  /**
   * Attempts to remove the currently active account.
   * Once an account is removed, it should redirect to the next available 
   * managed account or the add account page.
   */
  removeAccount(){
    const accountId = this.accounts.activeAccount.user_id;
    const accountName = this.accounts.activeAccount.user_name;
    const ownerAgentId = this.accounts.activeAccount.agent_id;

    // If the user is the account admin
    if(this._auth.agentId == ownerAgentId){
      // show warning message that removing ownership of the account will disable 
      // the account for him and the other agents. 
      let confirm = this._alertCtrl.create({
        title: 'Remove account? You are the admin of @'+accountName,
        message: 'Once removed, all Plugn features will stop functioning on this account.',
        buttons: [
          {
            text: 'Cancel',
          },
          {
            text: 'Remove Account',
            handler: () => {
              // Close the menu 
              this._menu.close();
              // Show Loading 
              let loading = this._loadingCtrl.create({
                spinner: 'crescent',
                content: 'Removing @'+accountName+' from your account..'
              });
              loading.present();

              // Request Removal of this accounts ownership
              this.accounts.removeAccountOwnership(accountId).subscribe(jsonResponse => {
                
                // Dismiss Loading
                loading.dismiss();

                // Reload account list on success
                if(jsonResponse.operation == "success"){
                  this.accounts.activeAccount = null;
                  this.accounts.refreshManagedAccounts(false);
                }else if(jsonResponse.operation == "error"){
                  // Show Alert with the message
                  let alert = this._alertCtrl.create({
                    subTitle: jsonResponse.message,
                    buttons: ['Ok']
                  });
                  alert.present();
                }else{
                  // Show alert with error not accounted for
                  let alert = this._alertCtrl.create({
                    title: "Unable to remove account",
                    message: "Please contact us for assistance",
                    buttons: ['Ok']
                  });
                  alert.present();
                }
              });
            }
          }
        ]
      });
      confirm.present();

    }else{
      // warn that he will no longer be able to manage the account as an agent until he is reinvited
      // Show confirm dialog before proceeding with removal
      let confirm = this._alertCtrl.create({
        title: 'Remove @'+accountName+'?',
        message: `Once removed you will lose access to the account. You may later regain access by receiving an invite from the account's admin.`,
        buttons: [
          {
            text: 'Cancel',
          },
          {
            text: 'Remove Account',
            handler: () => {
              // Close the menu 
              this._menu.close();
              // Show Loading 
              let loading = this._loadingCtrl.create({
                spinner: 'crescent',
                content: 'Removing @'+accountName+' from your account..'
              });
              loading.present();

              // Request Removal of this accounts ownership
              this._agentService.removeAssignment(accountId).subscribe(jsonResponse => {
                
                // Dismiss Loading
                loading.dismiss();

                // Reload account list on success
                if(jsonResponse.operation == "success"){
                  this.accounts.activeAccount = null;
                  this.accounts.refreshManagedAccounts(false);
                }else if(jsonResponse.operation == "error"){
                  // Show Alert with the message
                  let alert = this._alertCtrl.create({
                    subTitle: jsonResponse.message,
                    buttons: ['Ok']
                  });
                  alert.present();
                }else{
                  // Show alert with error not accounted for
                  let alert = this._alertCtrl.create({
                    title: "Unable to remove account",
                    message: "Please contact us for assistance",
                    buttons: ['Ok']
                  });
                  alert.present();
                }
              });

            }
          }
        ]
      });
      confirm.present();
    }
  }

}
