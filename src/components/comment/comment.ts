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
   */
  notifyOptions(){

    // Add link to Media view on swipe
    let toast = this._toastCtrl.create({
        message: 'Swipe the comment left for additional options',
        position: 'bottom',
        duration: 1500
      });
      toast.present();
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
        position: 'top',
        duration: 1500
      });
      toast.present();
    }
  }
    
}
