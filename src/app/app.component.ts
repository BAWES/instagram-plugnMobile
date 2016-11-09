import { Component, OnInit } from '@angular/core';
import { Platform, Events, ToastController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { NavigationPage } from '../pages/navigation/navigation';
import { LoginPage } from '../pages/start-pages/login/login';

import { AuthService } from '../providers/auth.service'


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp implements OnInit{
  rootPage: any;

  constructor(
    platform: Platform, 
    private _auth: AuthService,
    private _events: Events,
    private _toastCtrl: ToastController
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

      // Figure out which page to load on app start [Based on Auth]
      if(this._auth.isLoggedIn){
        this.rootPage = NavigationPage;
      }else this.rootPage = LoginPage;
      
    });
  }

  
  /**
   * Using Ng2 Lifecycle hooks because view lifecycle events don't trigger for Bootstrapped MyApp Component
   */
  ngOnInit(){
    // On Login Event, set root to Internal app page
    this._events.subscribe('user:login', (userEventData) => {
      this.rootPage = NavigationPage;
    });

    // On Logout Event, set root to Login Page
    this._events.subscribe('user:logout', (userEventData) => {

      // Set root to Login Page
      this.rootPage = LoginPage;

      // Show Toast Message explaining logout reason if there's one set
      let logoutReason = userEventData[0];
      if(logoutReason){
        this._presentToast(logoutReason);
      }
      
    });

  }

  private _presentToast(content: string) {
    let toast = this._toastCtrl.create({
      message: content,
      position: 'bottom',
      duration: 3000,
    });

    toast.present();
  }

}
