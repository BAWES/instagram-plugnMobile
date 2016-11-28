import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';

/*
  Media Stats Page
*/
@Component({
  selector: 'page-media-stats',
  templateUrl: 'media-stats.html'
})
export class MediaStatsPage {

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    ) {
    
  }

  

}