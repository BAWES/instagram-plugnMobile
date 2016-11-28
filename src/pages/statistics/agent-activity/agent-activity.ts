import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';

/*
  Agent Activity Statistics Page
*/
@Component({
  selector: 'page-agent-activity',
  templateUrl: 'agent-activity.html'
})
export class AgentActivityPage {

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    ) {
    
  }

  

}