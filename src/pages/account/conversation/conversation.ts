import { Component } from '@angular/core';
import { NavController, Events, MenuController, AlertController } from 'ionic-angular';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';
import { AnalyticsService } from '../../../providers/analytics.service';
// Models
import { Conversation } from '../../../models/conversation';
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
  public searchInput: string = "";

  constructor(
    public navCtrl: NavController,
    public conversations: ConversationService,
    public accounts: AccountService,
    private _alertCtrl: AlertController,
    private _analytics: AnalyticsService,
    private _backBtn: HardwareBackButtonService,
    private _events: Events,
    private _menuCtrl: MenuController,
    ) {}

  ionViewDidEnter() {
    this._analytics.trackView("Conversation List");

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
  loadUrl(page: string){
    if(page == "instagram"){
      this._events.publish("admin:loadPortal", 'instagram');
    }else if(page == 'billing'){
      this._events.publish("admin:loadPortal", 'billing');
    }
  }

  /**
   * Conversation to handle
   */
  handleConversation(convToHandle: Conversation){
    // Initiate Loading
    convToHandle.isLoading = true;

    // Request from Server to handle conv
    this.conversations
      .markConversationHandled(
        convToHandle.user_id,
        +convToHandle.comment_by_id,
        convToHandle.comment_by_username)
      .subscribe((jsonResp: {operation: string, message: string}) => {
        // Stop Loading
        convToHandle.isLoading = false;

        // Process response from server
        if(jsonResp.operation == "success"){
          // Require content reload
          this.accounts.contentNeedsRefresh = true;
          this.accounts.refreshContentIfRequired();
        }else if(jsonResp.operation == "error"){
          // Show Alert with the message
          let alert = this._alertCtrl.create({
            subTitle: jsonResp.message,
            buttons: ['Ok']
          });
          alert.present();
        }else{
          // Show alert with error not accounted for
          let alert = this._alertCtrl.create({
            title: "Unable to mark handled",
            message: "Please contact us for assistance",
            buttons: ['Ok']
          });
          alert.present();
        }
    });
  }

}
