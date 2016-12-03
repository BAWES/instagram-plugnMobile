import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Class for the my-activity page.
*/
@Component({
  selector: 'page-my-activity',
  templateUrl: 'my-activity.html'
})
export class MyActivityPage {

  constructor(public navCtrl: NavController) {}

  ionViewDidLoad() {
    console.log('Hello My Activity Page');
  }

}
