import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// Models
import { Media } from '../../models/media';

// Services
import { AuthHttpService } from './authhttp.service';

/*
  Manages Media belonging to an Instagram Account
*/
@Injectable()
export class MediaService {

  public isLoading = false;
  public refresherLoading = false; //Using the refresher component

  public mediaList: Media[]; // Full cached media list for loaded account
  public handledMedia: Media[]; // Handled Subset of mediaList
  public unhandledMedia: Media[]; // Unhandled Subset of mediaList

  private _mediaEndpoint: string = "/media";
  private _mediaDetailEndpoint: string = "/media/detail";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Get media comments
   * @param  {Media} media
   * @returns {Observable<any>}
   */
  getMediaDetail(media: Media): Observable<any>{
    let detailUrl = `${this._mediaDetailEndpoint}`
                    +`?mediaId=${media.media_id}`;

    return this._authhttp.get(detailUrl);
  }

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
   * Marks comments within a conversation as handled
   * @param {number} mediaId
   * @returns {Observable<any>}
   */
  markMediaHandled(mediaId: number){
    let handleUrl = `${this._mediaEndpoint}`;
    let params = {
      "mediaId": mediaId
    };

    return this._authhttp.patch(handleUrl, params);
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
