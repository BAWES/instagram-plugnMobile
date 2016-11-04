import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';

@Component({
  templateUrl: 'navigation.html'
})
export class NavigationPage {
  
  rootPage: any = HomePage;

  constructor() {

  }

  openPage(page){
    switch(page){
      case 1:
        this.rootPage = HomePage;
        break;
      case 2:
        this.rootPage = AboutPage;
        break;
      case 3:
        this.rootPage = ContactPage;
        break;
    }
  }

}
