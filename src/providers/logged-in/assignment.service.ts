import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
// Models
import { Assignment } from '../../models/assignment';
import { InstagramAccount } from '../../models/instagram-account';
// Services
import { AuthHttpService } from './authhttp.service';

/*
  Manages All Assignment done on all Accounts
*/
@Injectable()
export class AssignmentService {

  private _assignmentEndpoint: string = "/assignment";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Assign Agent by Email to Instagram Account
   * 
   * @param {string} agentEmail
   * @param {Assignment} assignment
   * @returns {Observable<any>}
   */
  assignAgentToAccount(agentEmail: string, account: InstagramAccount): Observable<any>{
    let url = `${this._assignmentEndpoint}`;
    
    return this._authhttp.post(url, {
      "accountId": account.user_id,
      "email": agentEmail
    });
  }

  /**
   * Removes Assignment from Instagram Account
   * 
   * @param {Assignment} assignment
   * @returns {Observable<any>}
   */
  removeAssignment(assignment: Assignment): Observable<any>{
    let url = `${this._assignmentEndpoint}?assignmentId=${assignment.assignment_id}`;
    
    return this._authhttp.delete(url);
  }


}
