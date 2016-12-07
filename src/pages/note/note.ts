import { Component, ViewChild } from '@angular/core';
import { NavController, Events, NavParams, AlertController } from 'ionic-angular';

import { AccountService } from '../../providers/logged-in/account.service';
import { NoteService } from '../../providers/logged-in/note.service';
import { HardwareBackButtonService } from '../../providers/hardwarebackbtn.service';
import { KeyboardService } from '../../providers/keyboard.service';

// Forms
import { FormBuilder, FormGroup } from '@angular/forms';

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
  public isSaving = false;

  public noteForm: FormGroup;
  @ViewChild('noteInput') noteInput: any;

  private activeNote: Note;

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    params: NavParams,
    public navCtrl: NavController,
    public accounts: AccountService,
    public noteService: NoteService,
    private _keyboard: KeyboardService,
    private _fb: FormBuilder,
    private _events: Events,
    private _alertCtrl: AlertController,
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

    // Focus the note input area
    setTimeout(() => {
      this.noteInput.setFocus();
      this._keyboard.open();
    }, 100);
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
    this.isSaving = true;
    this.activeNote.title = this.noteForm.value.title;
    this.activeNote.content = this.noteForm.value.content;

    let action;
    if(!this.activeNote.id){
      // Create
      action = this.noteService.createNote(this.activeNote);
    }else{
      // Update
      action = this.noteService.updateNote(this.activeNote);
    }
    
    action.subscribe(jsonResponse => {
      this.isSaving = false;

      // On Success
      if(jsonResponse.operation == "success"){
        // Close the page
        this.navCtrl.pop();
      }

      // On Failure
      if(jsonResponse.operation == "error"){
        let prompt = this._alertCtrl.create({
          message: jsonResponse.message,
          buttons: ["Ok"]
        });
        prompt.present();
      }
    });
  }
  

}