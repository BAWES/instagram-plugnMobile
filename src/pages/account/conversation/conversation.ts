import { Component } from '@angular/core';
import { NavController, Events, MenuController } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';
import { AnalyticsService } from '../../../providers/analytics.service';
import { AuthService } from '../../../providers/auth.service';
import { ConfigService } from '../../../providers/config.service';

// Pages
import { ConversationDetailPage } from '../conversation-detail/conversation-detail';

/*
  Conversation page.
*/
@Component({
  selector: 'page-conversation',
  templateUrl: 'conversation.html'
})
export class ConversationPage {
  public isAdmin: boolean = false;
  public searchInput: string = "";

  private _browser: InAppBrowser;

  constructor(
    public navCtrl: NavController,
    public conversations: ConversationService,
    public accounts: AccountService,
    public auth: AuthService,
    private _analytics: AnalyticsService,
    private _backBtn: HardwareBackButtonService,
    private _events: Events,
    private _menuCtrl: MenuController,
    private _config: ConfigService
    ) { 
      this.updateAdminStatus();
    }

  ionViewDidEnter() {
    this._analytics.trackView("Conversation List");
    this.updateAdminStatus();

    // Setup Back Button Behavior
    this._backBtn.toggleMenuOnBack();
    // Enable Swipe on Right Menu
    this._menuCtrl.swipeEnable(true, "right");

    // Request Refresh Content If Required
    this.accounts.refreshContentIfRequired();
  }

  /**
   * Trigger an event notifying that user is opening this page
   */
  ionViewWillEnter(){
    this._events.publish('view:selected', "conversation");
  }

  /**
   * Load Conversation Detail Page
   * @param  {} conversationItem
   */
  loadConversationDetail(conversationItem){
      this.navCtrl.push(ConversationDetailPage, {
        conversation: conversationItem
      });
  }

  /**
   * Update whether this user is an admin or not 
   */
  updateAdminStatus(){
    if(this.auth.agentId && this.accounts.activeAccount && 
      (this.accounts.activeAccount.agent_id == this.auth.agentId)){
      this.isAdmin = true;
    }
  }

  /**
   * Display search results based on user input
   */
  searchFilter(event){
    this.conversations.filterConversationsByString(this.searchInput);
  }

  /**
   * Refresh the view once dragged via ion-refresher
   * @param  {} refresher
   */
  doRefresh(refresher) {
    this._events.publish('refresh:requested', refresher);
  }

  /**
   * Load Specified Url
   */
  loadUrl(url: string){
    this._browser = new InAppBrowser(url, this._config.browserTarget, this._config.browserOptionsWithCache);
  }

}
