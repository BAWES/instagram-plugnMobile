import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';

/*
  Followers Page
*/
@Component({
  selector: 'page-followers',
  templateUrl: 'followers.html'
})
export class FollowersPage {

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    ) {
    
  }

  

}