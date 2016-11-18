import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, Content, AlertController } from 'ionic-angular';

// Models
import { Conversation } from '../../../models/conversation';
import { Comment } from '../../../models/comment';

// Services
import { ConversationService } from '../../../providers/logged-in/conversation.service';
import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

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

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    params: NavParams,
    public navCtrl: NavController,
    public conversations: ConversationService,
    public accounts: AccountService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _alertCtrl: AlertController
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
        setTimeout(() => {
         this.content.scrollToBottom(0);
        }, 50);
      }else this.addKeyboardMargin = false;
    });
  }

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

  ionViewWillLeave(){
    this._events.unsubscribe("account:switching", this._accountSwitchHandler);
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
