import { Component } from '@angular/core';
import { NavParams, Events } from 'ionic-angular';

// Models
import { Conversation } from '../../../models/conversation';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';

/*
  Conversation Detail page.
*/
@Component({
  selector: 'page-conversation-detail',
  templateUrl: 'conversation-detail.html'
})
export class ConversationDetailPage {
  public isLoading = false;

  public activeConversation: Conversation;
  public selectedTab: string = "conversation";

  public conversationDetail;

  constructor(
    params: NavParams,
    public conversations: ConversationService,
    private _events: Events,
    ) {
      this.activeConversation = params.get("conversation");      
    }

  ionViewDidLoad() {
    // Load and populate conversation detail
    this.isLoading = true;
    this.conversations.getConversationDetail(this.activeConversation).subscribe((jsonResponse) => {
      this.conversationDetail = jsonResponse.conversationComments;
    });
  }

  /**
   * Refresh the view once dragged via ion-refresher
   * @param  {} refresher
   */
  doRefresh(refresher) {
    //this._events.publish('refresh:requested', refresher);
  }

}
