import { Component } from '@angular/core';

import { MenuController, NavController } from 'ionic-angular';

import { LoginPage } from '../start-pages/login/login';


@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  showSkip = true;

  constructor(
    public navCtrl: NavController, 
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

  gotoLogin() {
    this.navCtrl.setRoot(LoginPage, {}, {
      animate: true,
      direction: 'forward'
    });
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd();
  }
  

}
