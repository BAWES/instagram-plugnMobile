import { Component, Input } from '@angular/core';
import { Platform, Haptic, ToastController } from 'ionic-angular';
import { Clipboard } from 'ionic-native';

// Models
import { Comment } from '../../models/comment';
// Services
import { AccountService } from '../../providers/logged-in/account.service';

/*
  Comment Component to setup styling for comments based on requirements
*/
@Component({
  selector: 'comment',
  templateUrl: 'comment.html'
})
export class CommentComponent {

  @Input('value') comment: Comment;

  constructor(
    public accounts: AccountService,
    private _platform: Platform,
    private _haptic: Haptic,
    private _toastCtrl: ToastController
    ) {
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
