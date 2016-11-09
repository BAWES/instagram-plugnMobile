import { Injectable } from '@angular/core';

import { AuthHttpService } from './authhttp.service';

/*
  Manages Media belonging to an Instagram Account
*/
@Injectable()
export class MediaService {

  public isLoading = true;
  public mediaList; // Cached media list for loaded account

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
    });
  }


}
