import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, Content, AlertController, MenuController } from 'ionic-angular';

// Models
import { Media } from '../../../models/media';
import { Comment } from '../../../models/comment';

// Services
import { MediaService } from '../../../providers/logged-in/media.service';
import { CommentService } from '../../../providers/logged-in/comment.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

// Forms
import { FormControl, Validators } from '@angular/forms';

/*
  Media Detail page.
*/
@Component({
  selector: 'page-media-detail',
  templateUrl: 'media-detail.html'
})
export class MediaDetailPage {
  @ViewChild(Content) content: Content;

  public isLoading = false;
  public isCommentSubmitting = false; // When comment is being submitted to server
  public handleLoading = false; // When media is being marked as handled

  public commentInputControl: FormControl;

  public activeMedia: Media;

  public mediaComments: Comment[];

  // Comment Count within Media 
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
    public mediaService: MediaService,
    public accounts: AccountService,
    private _commentService: CommentService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _alertCtrl: AlertController,
    private _menuCtrl: MenuController
    ) {
      this.activeMedia = params.get("media");

      // Initialize the Comment Input Form Control
      this.commentInputControl = new FormControl('', Validators.compose([Validators.required]));
    }

  /**
   * Page Constructed, Initialize
   */
  ionViewDidLoad() {
    // Load and populate media detail
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
    this._initRefresher();

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this.navCtrl.pop();
    });

    // Disable Swipe on Right Menu
    this._menuCtrl.swipeEnable(false, "right");

    // Announce the current navCtrl for browser back button to function
    this._events.publish("navController:current", this.navCtrl);

    // Subscribe to Pop this page off on account change
    this._events.subscribe("account:switching", this._accountSwitchHandler = (eventData) => {
      this.navCtrl.pop();
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
    /*
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
    */
  }

  /**
   * Marks media comments as handled
   */
  markMediaHandled(){
    /*
    // Initiate Loading
    this.handleLoading = true;

    // Request from Server
    this.conversations
      .markConversationHandled(
        this.activeMedia.user_id, 
        +this.activeMedia.comment_by_id, 
        this.activeMedia.comment_by_username)
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
            title: "Unable to mark comment handled",
            message: "Please contact us for assistance",
            buttons: ['Ok']
          });
          alert.present();
        }
      });
      */
  }

  /**
   * User clicked submit button for new comment
   */
  onCommentSubmit(){
    /*
    this.isCommentSubmitting = true;

    let accountId = this.accounts.activeAccount.user_id;
    let mediaId = this.activeMedia.media_id;
    let commentMessage = `@${this.activeMedia.comment_by_username} ${this.commentInputControl.value}`;
    let respondingTo = this.activeMedia.comment_by_username;

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
    */
  }

  /**
   * Load comments that are available within this media
   * If a callback is specified then it will load the comments in the background
   * and won't be showing the loading indicator which covers the page.
   * @param {any} [callback]
   * @param {string} [operation]
   */
  private _loadComments(callback?, operation?: string){
    /*
    if(!callback){
      this.isLoading = true;
    }
    
    this.conversations.getConversationDetail(this.activeMedia).subscribe((jsonResponse) => {
      this.isLoading = false;
      this.conversationComments = jsonResponse.conversationComments;

      // Transform All MySQL Dates into Time Since
      this.conversationComments = this.conversationComments.map((conversation) => {
        conversation.comment_datetime = this.conversations.getTimeSinceDate(conversation.comment_datetime);
        return conversation;
      });

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
    */
  }

}
