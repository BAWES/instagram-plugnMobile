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

  public activeConversation: Conversation;

  constructor(
    params: NavParams,
    public conversations: ConversationService,
    private _events: Events,
    ) {
      this.activeConversation = params.get("conversation");      
    }

  ionViewDidLoad() {
    // Initialize Class Here If Needed
  }

  /**
   * Trigger an event notifying that user is opening this page
   */
  ionViewWillEnter(){

  }

  /**
   * Refresh the view once dragged via ion-refresher
   * @param  {} refresher
   */
  doRefresh(refresher) {
    //this._events.publish('refresh:requested', refresher);
  }

}
