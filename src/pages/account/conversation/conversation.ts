import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the Conversation page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-conversation',
  templateUrl: 'conversation.html'
})
export class ConversationPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    //console.log('Hello ConversationPage Page');
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

}
