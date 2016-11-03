import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  homePage: any = HomePage;
  aboutPage: any = AboutPage;
  contactPage: any = ContactPage;

  constructor() {

  }

}
