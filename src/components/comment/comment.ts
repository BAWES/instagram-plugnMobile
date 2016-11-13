import { Component, Input } from '@angular/core';

// Models
import { Comment } from '../../models/comment';

/*
  Comment Component to setup styling for comments based on requirements
*/
@Component({
  selector: 'comment',
  templateUrl: 'comment.html'
})
export class CommentComponent {

  @Input('value') comment: Comment;

  constructor() {
    console.log('Hello Comment Component'+ this.comment);
  }

}
