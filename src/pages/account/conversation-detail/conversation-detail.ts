import { Component, ViewChild } from '@angular/core';
import { NavParams, Events, Content } from 'ionic-angular';

// Models
import { Conversation } from '../../../models/conversation';
import { Comment } from '../../../models/comment';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';

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
  public refresherLoading = false;

  public activeConversation: Conversation;
  public selectedTab: string = "conversation";

  public conversationComments: Comment[];

  public addKeyboardMargin = false;

  constructor(
    params: NavParams,
    public conversations: ConversationService,
    private _events: Events,
    ) {
      this.activeConversation = params.get("conversation");      
    }

  ionViewDidLoad() {
    // Load and populate conversation detail
    this._loadComments();

    // Add margin to ion-list of comments when keyboard opens
    // This will help scroll through and read comments while typing
    this._events.subscribe("keyboard:toggle", (keyboardData) => {
      if(keyboardData[0] == "open"){
        this.addKeyboardMargin = true;
      }else this.addKeyboardMargin = false;
    });
  }

  refreshContentHeight(){
    this.content.resize();
  }

  private _loadComments(){
    this.isLoading = true;
    this.conversations.getConversationDetail(this.activeConversation).subscribe((jsonResponse) => {
      this.isLoading = false;
      this.conversationComments = jsonResponse.conversationComments;

      // Transform All MySQL Dates into Time Since
      this.conversationComments = this.conversationComments.map((conversation) => {
        conversation.comment_datetime = this.conversations.getTimeSinceDate(conversation.comment_datetime);
        return conversation;
      });

      // Scroll to last Message in Conversation
      setTimeout(() => {
         this.content.scrollToBottom();
        }, 100);
      
    });
  }

}
