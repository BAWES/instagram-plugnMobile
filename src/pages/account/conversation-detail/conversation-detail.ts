import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, Content, AlertController, ModalController,
  MenuController } from 'ionic-angular';

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
import { AnalyticsService } from '../../../providers/analytics.service';

// Forms
import { FormControl, Validators } from '@angular/forms';

// Pages
import { TutorialInnerPage } from '../../tutorial-inner/tutorial-inner';
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

  // Whether this account has a Team or being handled by Individual
  public userType;

  constructor(
    params: NavParams,
    public navCtrl: NavController,
    public conversations: ConversationService,
    public accounts: AccountService,
    private _analytics: AnalyticsService,
    private _noteService: NoteService,
    private _commentService: CommentService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _alertCtrl: AlertController,
    private _menuCtrl: MenuController,
    private _modalCtrl: ModalController
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
    this.showTutorial();

    // Add margin to ion-list of comments when keyboard opens
    // This will help scroll through and read comments while typing
    this._events.subscribe("keyboard:toggle", (keyboardData) => {
      if(keyboardData == "open"){
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
    this._analytics.trackView("Conversation Detail");

    this._initRefresher();

    // Team vs Individual Management?
    this._setDefaultBehaviors();

    // Load Notes on Page Open
    this._loadNotes();

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
    });

    // Disable Swipe on Right Menu
    this._menuCtrl.swipeEnable(false, "right");

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

    // If User Type is Individual and has unhandled, mark this conversation as handled
    const unhandledCount = this.activeConversation.unhandledCount;
    if(unhandledCount && (this.userType == "individual")){
      this.markConversationHandled(true, false);
    }

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
   * Default Behaviors based on Team vs Individual Managing this Account
   */
  private _setDefaultBehaviors(){
    // Check whether Team or Individual opened page 
    const numberOfAgents = this.accounts.activeAccount.assignments.length;
    if(numberOfAgents > 1){
      this.userType = "team";
    }else this.userType = "individual";
  }

  /**
   * Marks conversation comments as handled
   */
  markConversationHandled(ignoreErrors:boolean = false, scrollOnComplete:boolean = true){
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
          // Require content reload
          this.accounts.contentNeedsRefresh = true;

          // Reload comments on success, stop loading on callback
          this._loadComments(() => {
            this.handleLoading = false;
            // Scroll to the comment at the bottom
            if(scrollOnComplete){
              setTimeout(() => {
                this.content.scrollToBottom(0);
              }, 100);
            }
          }, "handledConversation");
        }else if(jsonResp.operation == "error"){
          this.handleLoading = false

          if(!ignoreErrors){
            // Show Alert with the message
            let alert = this._alertCtrl.create({
              subTitle: jsonResp.message,
              buttons: ['Ok']
            });
            alert.present();
          }
          
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

          // Mark Conversation as Handled on New Comment 
          this.markConversationHandled(true);

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

    let modal = this._modalCtrl.create(NotePage, {
      note: newNote
    });
    // Refresh Note List if new note is saved
    modal.onDidDismiss(data => {
      if(data){
        if(data.refreshNotes){
          this._loadNotes();
        }
      }
    });
    modal.present();
  }

  /**
   * Load note page for updating
   */
  updateNote(noteToUpdate: Note){
    let modal = this._modalCtrl.create(NotePage, {
      note: noteToUpdate
    });
    // Refresh Note List if new note is saved
    modal.onDidDismiss(data => {
      if(data){
        if(data.refreshNotes){
          this._loadNotes();
        }
      }
    });
    modal.present();
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
   * Show Inner Tutorial (only show once per lifetime)
   */
  showTutorial(){
    let innerTutorialShown = localStorage.getItem("innerTutorialShown3");

    // If user hasn't been previously shown
    if(innerTutorialShown != "true"){
      // Load it as a "Modal" which can be exited
      let modal = this._modalCtrl.create(TutorialInnerPage, {});
      modal.onDidDismiss(data => {
        // Save that previously shown
        window.localStorage.setItem('innerTutorialShown3', "true");
      });
      modal.present();
    }
  }

}
