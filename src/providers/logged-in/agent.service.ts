import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
// Services
import { AuthHttpService } from './authhttp.service';

/*
  Agent API Endpoint
*/
@Injectable()
export class AgentService {

  private _agentEndpoint: string = "/agent";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Return a Profile summary for the currently logged in agent
   * @returns {Observable<any>}
   */
  getProfile(): Observable<any>{
    let url = `${this._agentEndpoint}`;
    
    return this._authhttp.get(url);
  }

  /**
   * Return a single-use auth key to login to IG or Billing portal
   * @returns {Observable<any>}
   */
  generateAuthKey(): Observable<any>{
    let url = `${this._agentEndpoint}/authkey`;
    
    return this._authhttp.get(url);
  }

  /**
   * Removes Assignment from Instagram Account
   * @param {number} accountId
   * @returns {Observable<any>}
   */
  removeAssignment(accountId: number): Observable<any>{
    let url = `${this._agentEndpoint}/unassign?accountId=${accountId}`;

    return this._authhttp.delete(url);
  }


}
