import { Component } from '@angular/core';
import { NavController, Events, NavParams } from 'ionic-angular';

import { AccountService } from '../../providers/logged-in/account.service';
import { NoteService } from '../../providers/logged-in/note.service';
import { HardwareBackButtonService } from '../../providers/hardwarebackbtn.service';

// Forms
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Models
import { Note } from '../../models/note';

/*
  Note Page
*/
@Component({
  selector: 'page-note',
  templateUrl: 'note.html'
})
export class NotePage {

  public isLoading = false;
  public noteForm: FormGroup;

  private activeNote: Note;

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    params: NavParams,
    public navCtrl: NavController,
    public accounts: AccountService,
    public noteService: NoteService,
    private _fb: FormBuilder,
    private _events: Events,
    private _backBtn: HardwareBackButtonService
    ) {
      // Load the passed Note model
      this.activeNote = params.get('note');

      // Initialize the Note Form
      this.noteForm = this._fb.group({
        title: [this.activeNote.title],
        content: [this.activeNote.content]
      });
    }

  /**
   * On Page Enter
   */
  ionViewDidEnter() {

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
    });

    // Subscribe to Pop this page off on account change
    this._events.subscribe("account:switching", this._accountSwitchHandler = (eventData) => {
      this.navCtrl.popToRoot();
    });
  }
  /**
   * Page is leaving
   */
  ionViewWillLeave(){
    // Unsubscribe
    this._events.unsubscribe("account:switching", this._accountSwitchHandler);
  }


  /**
   * Save the note
   */
  saveNote(){
    this.activeNote.title = this.noteForm.value.title;
    this.activeNote.content = this.noteForm.value.content;

    

    console.log(this.activeNote);
    //this.noteService.createNote(this.accounts.activeAccount.user_id, );

    // Close the page
    //this.navCtrl.pop();
  }
  

}