import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MediaPage } from '../media/media'
import { ConversationPage } from '../conversation/conversation'

/*
  Generated class for the AccountTabs tabs.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
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