import { Component, OnInit } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

import { AuthService } from '../providers/auth.service'


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp implements OnInit{
  rootPage: any = LoginPage;

  constructor(platform: Platform, public auth: AuthService) {
    
    /**
     * Run Ionic native functions once the platform is ready
     */
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  
  /**
   * Using Ng2 Lifecycle hooks because view lifecycle events don't trigger for Bootstrapped MyApp Component
   */
  ngOnInit(){

    // Figure out which page to load on app start [Based on Auth]
    if(this.auth.isLoggedIn){
      this.rootPage = TabsPage;
    }else this.rootPage = LoginPage;

  }

}
