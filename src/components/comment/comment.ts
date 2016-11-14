import { Component, Input } from '@angular/core';

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

  constructor(public accounts: AccountService) {
  }

}
