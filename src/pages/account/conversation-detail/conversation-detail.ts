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
  public refresherLoading = false;

  public activeConversation: Conversation;
  public selectedTab: string = "conversation";

  public conversationComments;

  constructor(
    params: NavParams,
    public conversations: ConversationService,
    private _events: Events,
    ) {
      this.activeConversation = params.get("conversation");      
    }

  ionViewDidLoad() {
    // Load and populate conversation detail
    this._loadComments();
  }

  private _loadComments(){
    this.isLoading = true;
    this.conversations.getConversationDetail(this.activeConversation).subscribe((jsonResponse) => {
      this.isLoading = false;
      this.conversationComments = jsonResponse.conversationComments;

      // Transform All MySQL Dates into Time Since
      this.conversationComments = this.conversationComments.map((conversation) => {
        conversation.comment_datetime = this.conversations.getTimeSinceDate(conversation.comment_datetime);
        return conversation;
      });
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
