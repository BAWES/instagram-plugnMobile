import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

// Services
import { AuthHttpService } from './authhttp.service';

/*
  Manages All Activity done on all Accounts
*/
@Injectable()
export class ActivityService {

  private _personalActivityEndpoint: string = "/activity";
  private _accountActivityEndpoint: string = "/activity/on-account";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Get agents personal activity
   * 
   * @param {number} accountId
   * @returns {Observable<any>}
   */
  getPersonalActivity(): Observable<any>{
    let url = `${this._personalActivityEndpoint}`;
    
    return this._authhttp.get(url);
  }

  /**
   * Get all activity detail on a specified account
   * 
   * @param {number} accountId
   * @returns {Observable<any>}
   */
  getActivityOnAccount(accountId: number): Observable<any>{
    let url = `${this._accountActivityEndpoint}?accountId=${accountId}`;
    
    return this._authhttp.get(url);
  }


}
