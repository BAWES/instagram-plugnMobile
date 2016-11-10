import { Injectable } from '@angular/core';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Conversations belonging to an Instagram Account
*/
@Injectable()
export class ConversationService {

  public isLoading = false;

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
  loadConversationsForAccount(account, callback?){
    let convUrl = `${this._conversationsEndpoint}?accountId=${account.user_id}`;

    this.isLoading = true;
    
    this._authhttp.get(convUrl).subscribe(jsonResponse => {
      // Run the callback if available
      if(callback){
        callback();
      }
      this.isLoading = false;
      this.conversationList = jsonResponse;
      this._sortConversationList();
    });
  }

  /**
   * Sorts the loaded conversations into two categories: Handled and Unhandled
   */
  private _sortConversationList(){
    // Populate Unhandled Conversations
    this.unhandledConversations = this.conversationList.filter((conversationItem) => {
      return parseInt(conversationItem.unhandledCount, 10) > 0;
    });

    // Populate Handled Conversations
    this.handledConversations = this.conversationList.filter((conversationItem) => {
      return parseInt(conversationItem.unhandledCount, 10) == 0;
    });
  }


}
