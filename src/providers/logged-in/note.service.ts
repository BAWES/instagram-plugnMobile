import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

// Services
import { AuthHttpService } from './authhttp.service';

// Models
import { Note } from '../../models/note';

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
   * @param {Note} note
   * @returns {Observable<any>}
   */
  createNote(note: Note): Observable<any>{
    let postUrl = `${this._noteEndpoint}`;
    let params = {
      "accountId": note.userId,
      "note_about_username": note.noteAboutUsername,
      "note_title": note.title,
      "note_text": note.content
    };
    return this._authhttp.post(postUrl, params);
  }

  /**
   * Update an existing note
   * 
   * @param {Note} note
   * @returns {Observable<any>}
   */
  updateNote(note: Note): Observable<any>{
    let postUrl = `${this._noteEndpoint}`;
    let params = {
      "accountId": note.userId,
      "noteId": note.id,
      "note_title": note.title,
      "note_text": note.content
    };
    return this._authhttp.patch(postUrl, params);
  }

  /**
   * Deletes a comment
   * @param {Note} note
   * @param {number} noteId
   * @returns {Observable<any>}
   */
  deleteNote(note: Note){
    let deleteUrl = `${this._noteEndpoint}?accountId=${note.userId}&noteId=${note.id}`;
    return this._authhttp.delete(deleteUrl);
  }


}
