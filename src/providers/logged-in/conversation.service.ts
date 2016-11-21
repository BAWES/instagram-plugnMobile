import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// Models
import { Conversation } from '../../models/conversation';
import { InstagramAccount } from '../../models/instagram-account';

// Services
import { AuthHttpService } from './authhttp.service';

/*
  Manages Conversations belonging to an Instagram Account
*/
@Injectable()
export class ConversationService {

  public isLoading = false;
  public refresherLoading = false; //Using the refresher component

  public conversationList: Conversation[]; // Full cached conversation list for loaded account
  public handledConversations: Conversation[]; // Handled Subset of conversationList
  public unhandledConversations: Conversation[]; // Unhandled Subset of conversationList

  // Archive Original Conversations for reseting search results
  private _origHandledConversations: Conversation[];
  private _origUnandledConversations: Conversation[];

  private _conversationsEndpoint: string = "/conversations";
  private _conversationDetailEndpoint: string = "/conversations/detail";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Get conversation detail between account and user
   * @param  {Conversation} conversation
   * @returns {Observable<any>}
   */
  getConversationDetail(conversation: Conversation): Observable<any>{
    let detailUrl = `${this._conversationDetailEndpoint}`
                    +`?accountId=${conversation.user_id}`
                    +`&commenterId=${conversation.comment_by_id}`
                    +`&commenterUsername=${conversation.comment_by_username}`;

    return this._authhttp.get(detailUrl);
  }

  /**
   * Marks comments within a conversation as handled
   * @param {number} accountId
   * @param {number} commenterId
   * @param {string} commenterUsername
   * @returns {Observable<any>}
   */
  markConversationHandled(accountId: number, commenterId: number, commenterUsername: string){
    let handleUrl = `${this._conversationDetailEndpoint}`;
    let params = {
      "accountId": accountId,
      "commenterId": commenterId,
      "commenterUsername": commenterUsername
    };

    return this._authhttp.patch(handleUrl, params);
  }

  /**
   * Load up to date Conversation list for the specified account id
   * @param  {InstagramAccount} account
   * @param  {fn} callback?
   * @param  {boolean} refresherLoading=false
   */
  loadConversationsForAccount(account: InstagramAccount, callback?, refresherLoading = false){
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

    // Store Copies for future reference
    this._origUnandledConversations = this.unhandledConversations.slice();
    this._origHandledConversations = this.handledConversations.slice();
  }

  /**
   * Filter Conversation List By a Specified Search String
   * @param  {string} searchInput
   */
  public filterConversationsByString(searchInput: string){
    searchInput = searchInput.toLowerCase();

    if(searchInput){
      // Filter Unhandled Conversations
      this.unhandledConversations = this._origUnandledConversations.filter((conversationItem) => {
        return conversationItem.comment_by_fullname.toLowerCase().indexOf(searchInput) >= 0
                || conversationItem.comment_by_username.toLowerCase().indexOf(searchInput) >= 0;
      });

      // Filter Handled Conversations
      this.handledConversations = this._origHandledConversations.filter((conversationItem) => {
        return (conversationItem.comment_by_fullname.toLowerCase().indexOf(searchInput) >= 0) 
                || (conversationItem.comment_by_username.toLowerCase().indexOf(searchInput) >= 0);
      });
    }else{
      this.unhandledConversations = this._origUnandledConversations.slice();
      this.handledConversations = this._origHandledConversations.slice();
    }
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
