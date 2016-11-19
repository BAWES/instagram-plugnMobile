import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

// Services
import { AuthHttpService } from './authhttp.service';

/*
  Manages Comment Functionality on the server
*/
@Injectable()
export class CommentService {

  private _commentEndpoint: string = "/comments";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Post a comment message on a specified media belonging to the account
   * If this is a response, need to specify who we are responding to
   * 
   * @param {number} accountId
   * @param {number} mediaId
   * @param {string} commentMessage
   * @param {string} [respondingTo] (optional)
   * @returns {Observable<any>}
   */
  postComment(accountId: number, mediaId: number, commentMessage: string, respondingTo?: string): Observable<any>{
    let postUrl = `${this._commentEndpoint}`;
    let params = {
      "accountId": accountId,
      "mediaId": mediaId,
      "commentMessage": commentMessage,
      "respondingTo": respondingTo
    };
    
    return this._authhttp.post(postUrl, params);
  }


}
