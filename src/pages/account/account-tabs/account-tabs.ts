import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

// Pages
import { MediaPage } from '../media/media';
import { ConversationPage } from '../conversation/conversation';

/*
  AccountTabs tabs.
*/
@Component({
  selector: 'page-account-tabs',
  templateUrl: 'account-tabs.html'
})
export class AccountTabsPage {

  tab1Root: any = MediaPage;
  tab2Root: any = ConversationPage;

  constructor(public navCtrl: NavController) {

  }

}