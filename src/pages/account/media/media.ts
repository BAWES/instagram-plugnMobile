import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the Media page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-media',
  templateUrl: 'media.html'
})
export class MediaPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    //console.log('Hello MediaPage Page');
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

}
