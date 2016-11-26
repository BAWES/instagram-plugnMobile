import { Component, Input } from '@angular/core';
import { Platform, Haptic, ToastController, AlertController, NavController } from 'ionic-angular';
import { Clipboard } from 'ionic-native';

// Models
import { Comment } from '../../models/comment';
// Services
import { AccountService } from '../../providers/logged-in/account.service';
import { CommentService } from '../../providers/logged-in/comment.service';
import { MediaService } from '../../providers/logged-in/media.service';
// Pages
import { ConversationDetailPage } from '../../pages/account/conversation-detail/conversation-detail';
import { MediaDetailPage } from '../../pages/account/media-detail/media-detail';

/*
  Comment Component to setup styling for comments based on requirements
*/
@Component({
  selector: 'comment',
  templateUrl: 'comment.html'
})
export class CommentComponent {

  @Input('value') comment: Comment;

  // Comment Type (Whether its a `media` comment or `conversation` comment)
  @Input() type: string = "conversation";

  // Loading Indicator for Sliding buttons 
  public handleLoading = false;
  public deleteLoading = false;

  constructor(
    public accounts: AccountService,
    private _navCtrl: NavController,
    private _commentSrvc: CommentService,
    private _mediaSrvc: MediaService,
    private _platform: Platform,
    private _haptic: Haptic,
    private _toastCtrl: ToastController,
    private _alertCtrl: AlertController
    ) {
  }

  /**
   * Mark Comment as Handled
   */
  handleComment(slidingItem, clickEvent){
    // Stop click event from propagation
    clickEvent.stopPropagation();
    
    // Show Loading
    this.handleLoading = true;

    // Mark Comment as Handled
    this._commentSrvc
      .markCommentHandled(this.comment.user_id, this.comment.comment_id)
      .subscribe((jsonResp: {operation: string, message: string}) => {
        // Hide loading 
        this.handleLoading = false

        // Process response from server
        if(jsonResp.operation == "success"){
          // On Success, set handled by you
          this.comment.comment_handled = "1";
          this.comment.handler_name = "you";

          slidingItem.close();
        }else if(jsonResp.operation == "error"){
          // Show Alert with the message
          let alert = this._alertCtrl.create({
            subTitle: jsonResp.message,
            buttons: ['Ok']
          });
          alert.present();
        }else{
          // Show alert with error not accounted for
          let alert = this._alertCtrl.create({
            title: "Unable to mark comment handled",
            message: "Please contact us for assistance",
            buttons: ['Ok']
          });
          alert.present();
        }
    });
  }

  /**
   * Delete this comment
   */
  deleteComment(slidingItem, clickEvent){
    // Stop click event from propagation
    clickEvent.stopPropagation();

    // Show Loading
    this.deleteLoading = true;

    // Mark Comment as Handled
    this._commentSrvc
      .deleteComment(this.comment.user_id, this.comment.comment_id)
      .subscribe((jsonResp: {operation: string, message: string}) => {
        // Hide loading 
        this.deleteLoading = false

        // Process response from server
        if(jsonResp.operation == "success"){
          // On Success, set comment as queued to be deleted
          this.comment.comment_deleted = '2';

          slidingItem.close();
        }else if(jsonResp.operation == "error"){
          // Show Alert with the message
          let alert = this._alertCtrl.create({
            subTitle: jsonResp.message,
            buttons: ['Ok']
          });
          alert.present();
        }else{
          // Show alert with error not accounted for
          let alert = this._alertCtrl.create({
            title: "Unable to delete comment",
            message: "Please contact us for assistance",
            buttons: ['Ok']
          });
          alert.present();
        }
    });
  }

  /**
   * Switch to Media View to find this comment
   */
  switchToMedia(){
    // Do nothing if its a queued comment
    if(this.comment.commentType == 'queue') return;

    // Search for the Media Item from Media List
    let mediaId = this.comment.media_id;
    let mediaItem;
    
    for(let i=0; i<this._mediaSrvc.mediaList.length; i++){
      if(this._mediaSrvc.mediaList[i].media_id == mediaId){
        mediaItem = this._mediaSrvc.mediaList[i];
        break;
      }
    }

    if(mediaItem){
      // Switch to Media Detail
      this._navCtrl.push(MediaDetailPage, { 
        media: mediaItem,
        locate: this.comment
      });
    }else{
      // Present Toast
      let toast = this._toastCtrl.create({
        message: 'Media not found',
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: "Ok"
      });
      toast.present();
    }
    
  }

  /**
   * Switch to Conversation View to find this comment
   */
  switchToConversation(){
    // Do nothing if it does not pass these rules
    if(this.comment.commentType == 'queue' ||
      this.comment.comment_by_username == this.accounts.activeAccount.user_name) return;

    // Navigate to conv detail page
    this._navCtrl.push(ConversationDetailPage, { 
        conversation: this.comment,
        locate: this.comment
    });
  }

  /**
   * Copy comment content to device clipboard
   */
  copyToClipboard(){
    if (this._platform.is('cordova')) {
      Clipboard.copy(`@${this.comment.comment_by_username}: ${this.comment.comment_text}`);
      this._haptic.notification({type: 'success'});
      let toast = this._toastCtrl.create({
        message: 'Comment has been copied to the clipboard',
        position: 'bottom',
        duration: 1500
      });
      toast.present();
    }
  }
    
}
