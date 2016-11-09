import { Injectable } from '@angular/core';

import { AuthHttpService } from './authhttp.service';
import { AccountService } from './account.service';

/*
  Manages Media belonging to an Instagram Account
*/
@Injectable()
export class MediaService {

  public isLoading = false;

  public mediaList; // Full cached media list for loaded account
  public handledMedia; // Handled Subset of mediaList
  public unhandledMedia; // Unhandled Subset of mediaList

  private _mediaEndpoint: string = "/media";

  constructor(private _authhttp: AuthHttpService, private _account: AccountService) { }

  /**
   * Load up to date media list for the specified account id
   * @param  {} account
   */
  loadMediaForAccount(account){
    let mediaUrl = `${this._mediaEndpoint}?accountId=${account.user_id}`;

    this.isLoading = true;
    
    this._authhttp.get(mediaUrl).subscribe(jsonResponse => {
      this.isLoading = false;
      this.mediaList = jsonResponse;
      this._sortMediaList();
    });
  }

  /**
   * Load media for the currently active account if available
   */
  loadMediaForCurrentlyActiveAccount(){
    if(this._account.activeAccount){
      this.loadMediaForAccount(this._account.activeAccount);
    }
  }

  /**
   * Sorts the loaded media into two categories: Handled and Unhandled
   */
  private _sortMediaList(){
    // Populate Unhandled Media
    this.unhandledMedia = this.mediaList.filter((mediaItem) => {
      return mediaItem.numCommentsUnhandled > 0;
    });

    // Populate Handled Media
    this.handledMedia = this.mediaList.filter((mediaItem) => {
      return mediaItem.numCommentsUnhandled == 0;
    });
  }


}
