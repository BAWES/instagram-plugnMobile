import { Injectable } from '@angular/core';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Media belonging to an Instagram Account
*/
@Injectable()
export class MediaService {

  public isLoading = true;

  public mediaList; // Full cached media list for loaded account
  public handledMedia; // Handled Subset of mediaList
  public unhandledMedia; // Unhandled Subset of mediaList

  private _mediaEndpoint: string = "/media";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Load up to date media list for the specified account id
   * @param  {number} accountId
   */
  loadMediaForAccount(accountId: number){
    let mediaUrl = `${this._mediaEndpoint}?accountId=${accountId}`;

    this.isLoading = true;

    this._authhttp.get(mediaUrl).subscribe(jsonResponse => {
      this.isLoading = false;
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
