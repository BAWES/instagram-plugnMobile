import { Injectable } from '@angular/core';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Conversations belonging to an Instagram Account
*/
@Injectable()
export class ConversationService {

  public isLoading = false;
  public refresherLoading = false; //Using the refresher component

  public conversationList; // Full cached conversation list for loaded account
  public handledConversations; // Handled Subset of conversationList
  public unhandledConversations; // Unhandled Subset of conversationList

  private _conversationsEndpoint: string = "/conversations";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Load up to date Conversation list for the specified account id
   * @param  {} account
   * @param  {} callback?
   */
  loadConversationsForAccount(account, callback?, refresherLoading = false){
    let convUrl = `${this._conversationsEndpoint}?accountId=${account.user_id}`;

    this.isLoading = true;
    this.refresherLoading = refresherLoading;
    
    this._authhttp.get(convUrl).subscribe(jsonResponse => {
      // Run the callback if available
      if(callback){
        callback();
      }
      this.isLoading = false;
      this.refresherLoading = false;
      this.conversationList = jsonResponse;
      this._sortConversationList();
    });
  }

  /**
   * Sorts the loaded conversations into two categories: Handled and Unhandled
   */
  private _sortConversationList(){
    // Transform All MySQL Dates into Time Since
    this.conversationList = this.conversationList.map((conversation) => {
      conversation.comment_datetime = this.getTimeSinceDate(conversation.comment_datetime);
      return conversation;
    });

    // Populate Unhandled Conversations
    this.unhandledConversations = this.conversationList.filter((conversationItem) => {
      return parseInt(conversationItem.unhandledCount, 10) > 0;
    });

    // Populate Handled Conversations
    this.handledConversations = this.conversationList.filter((conversationItem) => {
      return parseInt(conversationItem.unhandledCount, 10)? false: true;
    });
  }

  /**
   * Returns the time since provided date 
   * Converts date from Mysql format to JS before testing
   * @param  {} dateInput
   */
  getTimeSinceDate(dateInput){
    // Split MySQL timestamp into [ Y, M, D, h, m, s ]
    let t = dateInput.split(/[- :]/);
    // Apply each element to the Date function
    // Did a -3 to the hour portion because server is storing in Kuwaiti timezone gmt+3
    // While this function assumes UTC and automatically does +3
    let date = new Date(Date.UTC(+t[0], +t[1]-1, +t[2], +t[3]-3, +t[4], +t[5]));
    
    let seconds = Math.floor((+new Date() - +date) / 1000);
    let intervalType;

    let interval = Math.floor(seconds / 31536000);
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
