import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, Content, AlertController, MenuController, ToastController } from 'ionic-angular';

// Models
import { Conversation } from '../../../models/conversation';
import { Comment } from '../../../models/comment';
import { Note } from '../../../models/note';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';
import { CommentService } from '../../../providers/logged-in/comment.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { NoteService } from '../../../providers/logged-in/note.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

// Forms
import { FormControl, Validators } from '@angular/forms';

// Pages
import { NotePage } from '../../note/note';

/*
  Conversation Detail page.
*/
@Component({
  selector: 'page-conversation-detail',
  templateUrl: 'conversation-detail.html'
})
export class ConversationDetailPage {
  @ViewChild(Content) content: Content;

  public isLoading = false;
  public notesLoading = false;
  public isCommentSubmitting = false; // When comment is being submitted to server
  public handleLoading = false; // When conversation is being marked as handled

  public commentInputControl: FormControl;

  public activeConversation: Conversation;
  public selectedTab: string = "conversation";

  public conversationComments: Comment[];
  private _lastCommentsMediaId: number; // Stores the last comments media id for posting response

  public userNotes: Note[]; // Notes made on this user

  // Comment Count within Conversation 
  public commentCount: number;
  public previousCommentCount: number; // Stored to check if there's updates since last refresh

  public addKeyboardMargin = false;

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  // Interval Refresh Timer
  private _refreshTimer;

  constructor(
    params: NavParams,
    public navCtrl: NavController,
    public conversations: ConversationService,
    public accounts: AccountService,
    private _noteService: NoteService,
    private _commentService: CommentService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _alertCtrl: AlertController,
    private _menuCtrl: MenuController,
    private _toastCtrl: ToastController
    ) {
      this.activeConversation = params.get("conversation");

      // Initialize the Comment Input Form Control
      this.commentInputControl = new FormControl('', Validators.compose([Validators.required]));
    }

  /**
   * Page Constructed, Initialize
   */
  ionViewDidLoad() {
    // Load and populate conversation detail
    this._loadComments();

    // Present Sliding Tutorial
    this.notifyOptions();

    // Add margin to ion-list of comments when keyboard opens
    // This will help scroll through and read comments while typing
    this._events.subscribe("keyboard:toggle", (keyboardData) => {
      if(keyboardData[0] == "open"){
        this.addKeyboardMargin = true;
        setTimeout(() => {
         this.content.scrollToBottom(0);
        }, 50);
      }else this.addKeyboardMargin = false;
    });
  }

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    this._initRefresher();

    // Load Notes on Page Open 
    this._loadNotes();

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
    });

    // Disable Swipe on Right Menu
    this._menuCtrl.swipeEnable(false, "right");

    // Announce the current navCtrl for browser back button to function
    this._events.publish("navController:current", this.navCtrl);

    // Subscribe to Pop this page off on account change
    this._events.subscribe("account:switching", this._accountSwitchHandler = (eventData) => {
      this.navCtrl.popToRoot();
    });
  }
  /**
   * Page is leaving
   */
  ionViewWillLeave(){
    // Disable Refresh Timer 
    clearInterval(this._refreshTimer);

    // Unsubscribe
    this._events.unsubscribe("account:switching", this._accountSwitchHandler);
  }

  /**
   * Initialize the comment content refresher
   */
  private _initRefresher(){
    // Refresh Comments every X Seconds
    let numSeconds = 20 * 1000;
    this._refreshTimer = setInterval(() => {
      // Reload comments then execute callback
      this._loadComments(() => {
        // If the comment count has changed, scroll to bottom
        if(this.commentCount != this.previousCommentCount){
          setTimeout(() => {
            this.content.scrollToBottom();
          }, 100);
          // Update comment count 
          this.previousCommentCount = this.commentCount;
        }
      }, "refresh");
    }, numSeconds);
  }

  /**
   * Marks conversation comments as handled
   */
  markConversationHandled(){
    // Initiate Loading
    this.handleLoading = true;

    // Request from Server
    this.conversations
      .markConversationHandled(
        this.activeConversation.user_id, 
        +this.activeConversation.comment_by_id, 
        this.activeConversation.comment_by_username)
      .subscribe((jsonResp: {operation: string, message: string}) => {
        // Process response from server
        if(jsonResp.operation == "success"){
          // Reload comments on success, stop loading on callback
          this._loadComments(() => {
            this.handleLoading = false;
            // Scroll to the comment at the bottom 
            setTimeout(() => {
              this.content.scrollToBottom(0);
            }, 100);
          }, "handledConversation");
        }else if(jsonResp.operation == "error"){
          this.handleLoading = false
          // Show Alert with the message
          let alert = this._alertCtrl.create({
            subTitle: jsonResp.message,
            buttons: ['Ok']
          });
          alert.present();
        }else{
          this.handleLoading = false
          // Show alert with error not accounted for
          let alert = this._alertCtrl.create({
            title: "Unable to mark handled",
            message: "Please contact us for assistance",
            buttons: ['Ok']
          });
          alert.present();
        }
      });
  }

  /**
   * User clicked submit button for new comment
   */
  onCommentSubmit(){
    this.isCommentSubmitting = true;

    let accountId = this.accounts.activeAccount.user_id;
    let mediaId = this._lastCommentsMediaId;
    let commentMessage = `@${this.activeConversation.comment_by_username} ${this.commentInputControl.value}`;
    let respondingTo = this.activeConversation.comment_by_username;

    this._commentService
      .postComment(accountId, mediaId, commentMessage, respondingTo)
      .subscribe((jsonResponse:{operation: string, message: string}) => {
        // On Success execute logic and return
        if(jsonResponse.operation == "success"){
          // Execute completed once refreshed comments are loaded
          this._loadComments(() => {
            // Clear comment input
            this.commentInputControl.setValue("");
            // Hide loading indicator
            this.isCommentSubmitting = false;
            // Scroll to the comment at the bottom 
            setTimeout(() => {
              this.content.scrollToBottom(0);
            }, 100);
          }, "postedComment");

          return;
        }

        // On Error: Show Alert
        if(jsonResponse.operation == "error"){
          let prompt = this._alertCtrl.create({
            message: jsonResponse.message,
            buttons: ["Ok"]
          });
          prompt.present();
        }

        this.isCommentSubmitting=false;
    });
  }

  /**
   * Recalculate and Refresh the content height
   */
  refreshContentHeight(){
    this.content.resize();
  }

  /**
   * Load comments that are available within this conversation
   * If a callback is specified then it will load the comments in the background
   * and won't be showing the loading indicator which covers the page.
   * @param {any} [callback]
   * @param {string} [operation]
   */
  private _loadComments(callback?, operation?: string){
    if(!callback){
      this.isLoading = true;
    }
    
    this.conversations.getConversationDetail(this.activeConversation).subscribe((jsonResponse) => {
      this.isLoading = false;
      this.conversationComments = jsonResponse.conversationComments;

      // Transform All MySQL Dates into Time Since
      this.conversationComments = this.conversationComments.map((conversation) => {
        conversation.comment_datetime = this.conversations.getTimeSinceDate(conversation.comment_datetime);
        return conversation;
      });

      // Store the last comments media id for posting comment response
      this._lastCommentsMediaId = this.conversationComments[this.conversationComments.length - 1].media_id;

      // Store the comment count for this conversation 
      this.commentCount = this.conversationComments.length;
      // Store previous number of comments on refresh or posted comment
      if(!callback || (operation && operation == "postedComment")){
        this.previousCommentCount = this.conversationComments.length;
      }

      // Scroll to last Message in Conversation
      if(!callback){
        setTimeout(() => {
         this.content.scrollToBottom();
        }, 100);
      }else{
        // Execute the callback
        callback();
      }
      
    });
  }

  /**
   * Loads notes for display on user detail tab
   */
  private _loadNotes(){
    this.notesLoading = true;

    this._noteService
      .getNotes(this.activeConversation.user_id, this.activeConversation.comment_by_username)
      .subscribe(jsonResponse => {
        this.notesLoading = false;
        this.userNotes = jsonResponse;
      });
  }

  /**
   * When user wants to create a new note
   */
  createNewNote(){
    let newNote = new Note();
    newNote.noteAboutUsername = this.activeConversation.comment_by_username;
    newNote.userId = this.activeConversation.user_id;

    this.navCtrl.push(NotePage, {
      note: newNote
    });
  }

  /**
   * Load note page for updating
   */
  updateNote(noteToUpdate: Note){
    this.navCtrl.push(NotePage, {
      note: noteToUpdate
    });
  }

  /**
   * Delete note from server then refresh
   */
  deleteNote(event, noteToDelete: Note){
    // Stop Propagation since delete button is inside the update button
    event.stopPropagation();

    // Confirm if user really wants to delete 
    let confirm = this._alertCtrl.create({
      title: 'Delete this note?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            // Proceed with deletion
            noteToDelete.isDeleting = true;

            this._noteService.deleteNote(noteToDelete).subscribe(jsonResponse => {
              // On Success
              if(jsonResponse.operation == "success"){
                // Refresh Notes
                this._loadNotes();
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
      ]
    });
    confirm.present();
  }

  /**
   * Present toast showing available options when dealing with this item
   * TOAST IS TO BE SHOWN ONCE A DAY ONLY!
   */
  notifyOptions(){
    let dayOfTheMonth = new Date().getDate();
    let previouslyNotifiedDay = parseInt(localStorage.getItem("swipeNotificationDate"));

    // If user hasn't been previously notified, or if he's been notified but on a different day
    if(!previouslyNotifiedDay || (dayOfTheMonth != previouslyNotifiedDay)){
      // Present Toast
      let toast = this._toastCtrl.create({
        message: 'Swipe a comment to the left for additional options',
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: "Ok"
      });
      toast.present();
      
      // Save today as the previously notified day
      window.localStorage.setItem('swipeNotificationDate', dayOfTheMonth+"");
    }
  }

}
