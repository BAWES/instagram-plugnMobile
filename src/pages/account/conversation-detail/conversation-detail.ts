import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { ConversationService } from '../../../providers/logged-in/conversation.service';

/*
  Conversation Detail page.
*/
@Component({
  selector: 'page-conversation-detail',
  templateUrl: 'conversation-detail.html'
})
export class ConversationDetailPage {

  constructor(
    public navCtrl: NavController, 
    public conversations: ConversationService,
    private _events: Events,
    ) { }

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
