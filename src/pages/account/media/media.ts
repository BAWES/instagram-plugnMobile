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
    private _events: Events,
    ) {}

  ionViewDidLoad() {
    // Initialize Class Here If Needed
  }

  /**
   * Trigger an event notifying that user is opening this page
   */
  ionViewWillEnter(){
    this._events.publish('view:selected', "media");
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

}
