import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';

/*
  Following Page
*/
@Component({
  selector: 'page-following',
  templateUrl: 'following.html'
})
export class FollowingPage {

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    // Load this account stats if not already loaded
    this.accounts.loadAccountStats();
  }

  

}