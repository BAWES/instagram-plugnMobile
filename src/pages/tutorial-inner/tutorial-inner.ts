import { Component } from '@angular/core';
import { MenuController, NavController, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-tutorial-inner',
  templateUrl: 'tutorial-inner.html'
})
export class TutorialInnerPage {
  showSkip = true;

  constructor(
    public navCtrl: NavController, 
    private _viewCtrl: ViewController,
    public menu: MenuController
    ) {}

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }

  /**
   * Close the page
   */
  close(){
    this._viewCtrl.dismiss();
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd();
  }

}
