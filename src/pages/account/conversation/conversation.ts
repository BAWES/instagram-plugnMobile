import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { ConversationService } from '../../../providers/logged-in/conversation.service';

/*
  Conversation page.
*/
@Component({
  selector: 'page-conversation',
  templateUrl: 'conversation.html'
})
export class ConversationPage {

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
    this._events.publish('view:selected', "conversation");
  }

  /**
   * Refresh the view once dragged via ion-refresher
   * @param  {} refresher
   */
  doRefresh(refresher) {
    this._events.publish('refresh:requested', refresher);
  }

  /**
   * Returns the time since provided date
   * @param  {} date
   */
  getTimeSinceDate(date){
    if (typeof date !== 'object') {
        date = new Date(date);
    }

    var seconds = Math.floor((+new Date() - date) / 1000);
    var intervalType;

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'year';
    } else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'month';
        } else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'day';
            } else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "hour";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "minute";
                    } else {
                        interval = seconds;
                        intervalType = "second";
                    }
                }
            }
        }
    }

    if (interval > 1 || interval === 0) {
        intervalType += 's';
    }

    return interval + ' ' + intervalType + ' ago';
  }

}
