import { Injectable } from '@angular/core';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Media belonging to an Instagram Account
*/
@Injectable()
export class MediaService {

  public isLoading = false;
  public refresherLoading = false; //Using the refresher component

  public mediaList; // Full cached media list for loaded account
  public handledMedia; // Handled Subset of mediaList
  public unhandledMedia; // Unhandled Subset of mediaList

  private _mediaEndpoint: string = "/media";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Load up to date media list for the specified account id
   * @param  {} account
   * @param  {} callback?
   * @param  {} refresherLoading
   */
  loadMediaForAccount(account, callback?, refresherLoading = false){
    let mediaUrl = `${this._mediaEndpoint}?accountId=${account.user_id}`;

    this.isLoading = true;
    this.refresherLoading = refresherLoading;
    
    this._authhttp.get(mediaUrl).subscribe(jsonResponse => {
      // Run the callback if available
      if(callback){
        callback();
      }
      this.isLoading = false;
      this.refresherLoading = false;
      this.mediaList = jsonResponse;
      this._sortMediaList();
    });
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
