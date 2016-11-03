import { Component, OnInit } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/start-pages/login/login';

import { AuthService } from '../providers/auth.service'


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp implements OnInit{
  rootPage: any = LoginPage;

  constructor(
    platform: Platform, 
    private _auth: AuthService,
    private _events: Events
    ) {
    
    /**
     * Run Ionic native functions once the platform is ready
     */
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      if (platform.is('cordova')) {
        StatusBar.styleDefault();
      }
      
    });
  }

  
  /**
   * Using Ng2 Lifecycle hooks because view lifecycle events don't trigger for Bootstrapped MyApp Component
   */
  ngOnInit(){
    // Figure out which page to load on app start [Based on Auth]
    if(this._auth.isLoggedIn){
      this.rootPage = TabsPage;
    }else this.rootPage = LoginPage;

    // On Login Event, set root to Internal app page
    this._events.subscribe('user:login', (userEventData) => {
      this.rootPage = TabsPage;
    });

    // On Logout Event, set root to Login Page
    this._events.subscribe('user:logout', (userEventData) => {
      let logoutReason = userEventData[0];
      console.log('User logged out. Reason: '+logoutReason);

      this.rootPage = LoginPage;
    });

  }

}
