import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

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
    private _backBtn: HardwareBackButtonService,
    private _events: Events,
    ) { }

  ionViewDidLoad() {
    // Initialize Class Here If Needed
  }

  ionViewDidEnter() {
    // Setup Back Button Behavior
    this._backBtn.toggleMenuOnBack();
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

}
