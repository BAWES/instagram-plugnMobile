import { Injectable } from '@angular/core';

import { AuthHttpService } from './authhttp.service';
import { AccountService } from './account.service';

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

  constructor(private _authhttp: AuthHttpService, private _account: AccountService) { }

  /**
   * Load up to date Conversation list for the specified account id
   * @param  {} account
   */
  loadConversationsForAccount(account){
    let convUrl = `${this._conversationsEndpoint}?accountId=${account.user_id}`;

    this.isLoading = true;
    
    this._authhttp.get(convUrl).subscribe(jsonResponse => {
      this.isLoading = false;
      this.conversationList = jsonResponse;
      this._sortConversationList();
    });
  }

  /**
   * Load conversations for the currently active account if available
   */
  loadConversationsForCurrentlyActiveAccount(){
    if(this._account.activeAccount){
      this.loadConversationsForAccount(this._account.activeAccount);
    }
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
