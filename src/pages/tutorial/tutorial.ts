import { Component } from '@angular/core';

import { MenuController, NavController } from 'ionic-angular';

import { LoginPage } from '../start-pages/login/login';


export interface Slide {
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  slides: Slide[];
  showSkip = true;

  constructor(
    public navCtrl: NavController, 
    public menu: MenuController
    ) {

    this.slides = [
        {
          title: "Slide1 - title",
          description: "desc1",
          image: 'assets/img/ica-slidebox-img-1.png',
        },
        {
          title: "Slide2 - title",
          description: "desc2",
          image: 'assets/img/ica-slidebox-img-2.png',
        },
        {
          title: "Slide3 - title",
          description: "desc3",
          image: 'assets/img/ica-slidebox-img-3.png',
        }
      ];
  }

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
