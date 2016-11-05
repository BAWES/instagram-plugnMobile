import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';

import { AuthService } from '../../providers/auth.service'

@Component({
  selector: 'page-navigation',
  templateUrl: 'navigation.html'
})
export class NavigationPage {

  rootPage: any = HomePage;

  constructor(private _auth: AuthService) {

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

  logout(){
    this._auth.logout();
  }

}
