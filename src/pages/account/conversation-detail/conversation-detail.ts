import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, Content, AlertController } from 'ionic-angular';

// Models
import { Conversation } from '../../../models/conversation';
import { Comment } from '../../../models/comment';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';
import { CommentService } from '../../../providers/logged-in/comment.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

// Forms
import { FormControl, Validators } from '@angular/forms';

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
  public isCommentSubmitting = false; // When comment is being submitted to server

  public commentInputControl: FormControl;

  public activeConversation: Conversation;
  public selectedTab: string = "conversation";

  public conversationComments: Comment[];
  private _lastCommentsMediaId: number; // Stores the last comments media id for posting response

  public addKeyboardMargin = false;

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    params: NavParams,
    public navCtrl: NavController,
    public conversations: ConversationService,
    public accounts: AccountService,
    private _commentService: CommentService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _alertCtrl: AlertController
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
    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this.navCtrl.pop();
    });

    // Announce the current navCtrl for browser back button to function
    this._events.publish("navController:current", this.navCtrl);

    // Subscribe to Pop this page off on account change
    this._events.subscribe("account:switching", this._accountSwitchHandler = (eventData) => {
      this.navCtrl.pop();
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
          });

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
   * Page is leaving
   */
  ionViewWillLeave(){
    this._events.unsubscribe("account:switching", this._accountSwitchHandler);
  }

  showCreateNoteForm(){
    let prompt = this._alertCtrl.create({
      title: 'Add Note',
      inputs: [
        {
          name: 'title',
          placeholder: 'Title'
        },
        {
          name: 'note',
          placeholder: 'Note'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log('Saved clicked');
          }
        }
      ]
    });
    prompt.present();
  }

  /**
   * Recalculate and Refresh the content height
   */
  refreshContentHeight(){
    this.content.resize();
  }

  /**
   * Load comments that are available within this conversation
   * @param {any} [callback]
   */
  private _loadComments(callback?){
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

      // Scroll to last Message in Conversation
      if(!callback){
        setTimeout(() => {
         this.content.scrollToBottom();
        }, 100);
      }else{
        // Execute the callback and scroll to bottom
        callback();
        setTimeout(() => {
         this.content.scrollToBottom(0);
        }, 100);
      }
      
    });
  }

}
