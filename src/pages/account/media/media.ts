import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { MediaService } from '../../../providers/logged-in/media.service';

/*
  Media page.
*/
@Component({
  selector: 'page-media',
  templateUrl: 'media.html'
})
export class MediaPage {

  constructor(
    public navCtrl: NavController, 
    public media: MediaService,
    events: Events,
    ) {
      // Listen to selected account event and load media for selected account
      events.subscribe('account:selected', (accountEventData) => {
        let userAccount = accountEventData[0];
        this.media.loadMediaForAccount(userAccount.user_id);
      });
    }

  ionViewDidLoad() {
    
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

}
