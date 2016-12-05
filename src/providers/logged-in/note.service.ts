import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

// Services
import { AuthHttpService } from './authhttp.service';

/*
  Manages Note Functionality on the server
*/
@Injectable()
export class NoteService {

  private _noteEndpoint: string = "/notes";

  constructor(private _authhttp: AuthHttpService) { }

  /**
   * Get a list of notes made on the username for the account
   * 
   * @param {number} accountId
   * @param {string} username
   * @returns {Observable<any>}
   */
  getNotes(accountId: number, username: string): Observable<any>{
    let url = `${this._noteEndpoint}`
                    +`?accountId=${accountId}`
                    +`?username=${username}`;
    return this._authhttp.get(url);
  }

  /**
   * Create a new note
   * 
   * @param {number} accountId
   * @param {string} username
   * @param {string} noteTitle
   * @param {string} noteText
   * @returns {Observable<any>}
   */
  createNote(accountId: number, username: string, noteTitle: string, noteText: string): Observable<any>{
    let postUrl = `${this._noteEndpoint}`;
    let params = {
      "accountId": accountId,
      "note_about_username": username,
      "note_title": noteTitle,
      "note_text": noteText
    };
    return this._authhttp.post(postUrl, params);
  }

  /**
   * Update an existing note
   * 
   * @param {number} accountId
   * @param {number} noteId
   * @param {string} noteTitle
   * @param {string} noteText
   * @returns {Observable<any>}
   */
  updateNote(accountId: number, noteId: number, noteTitle: string, noteText: string): Observable<any>{
    let postUrl = `${this._noteEndpoint}`;
    let params = {
      "accountId": accountId,
      "noteId": noteId,
      "note_title": noteTitle,
      "note_text": noteText
    };
    return this._authhttp.patch(postUrl, params);
  }

  /**
   * Deletes a comment
   * @param {number} accountId
   * @param {number} noteId
   * @returns {Observable<any>}
   */
  deleteNote(accountId: number, noteId: number){
    let deleteUrl = `${this._noteEndpoint}?accountId=${accountId}&noteId=${noteId}`;
    return this._authhttp.delete(deleteUrl);
  }


}
