import { Component, OnInit, NgZone } from '@angular/core';
import { Platform, Events, ToastController, IonicApp, App, MenuController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

import { NavigationPage } from '../pages/navigation/navigation';
import { LoginPage } from '../pages/start-pages/login/login';

import { AuthService } from '../providers/auth.service';
import { KeyboardService } from '../providers/keyboard.service';


@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp implements OnInit{
  rootPage: any;

  private _innerNavCtrl; //populated from events on pages within tabs

  constructor(
    private _platform: Platform, 
    private _auth: AuthService,
    private _keyboard: KeyboardService,
    private _events: Events,
    private _toastCtrl: ToastController,
    private _app: App, private _ionicApp: IonicApp, private _menu: MenuController,
    private _zone: NgZone
    ) {
    
    /**
     * Run Ionic native functions once the platform is ready
     */
    this._platform.ready().then(() => {

      if (this._platform.is('cordova')) {
        StatusBar.styleDefault();
      }

      if (this._platform.is('ios')) {
        this._keyboard.disableScroll();
      }

      // Fix back button behavior on browser
      this._setupBrowserBackButtonBehavior();

      // Figure out which page to load on app start [Based on Auth]
      if(this._auth.isLoggedIn){
        this.rootPage = NavigationPage;
      }else{
        this.rootPage = LoginPage;
      }
      
    });
  }

  
  /**
   * Using Ng2 Lifecycle hooks because view lifecycle events don't trigger for Bootstrapped MyApp Component
   */
  ngOnInit(){
    // On Login Event, set root to Internal app page
    this._events.subscribe('user:login', (userEventData) => {
      this._zone.run(() => {
        this.rootPage = NavigationPage;
      })
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


  /**
   * Make Desktop Browser back button function better
   */
  private _setupBrowserBackButtonBehavior () {

    // If on web version (browser)
    if (window.location.protocol !== "file:") {

      // Listen to browser pages
      this._events.subscribe("navController:current", (navCtrlData) => {
        this._innerNavCtrl = navCtrlData[0];
      });

      // Register browser back button action(s)
      window.onpopstate = (evt) => {

        // Close menu if open
        if (this._menu.isOpen()) {
          this._menu.close ();
          return;
        }

        // Close any active modals or overlays
        let activePortal = this._ionicApp._loadingPortal.getActive() ||
          this._ionicApp._modalPortal.getActive() ||
          this._ionicApp._toastPortal.getActive() ||
          this._ionicApp._overlayPortal.getActive();

        if (activePortal) {
          activePortal.dismiss();
          return;
        }

        // Navigate back on main active nav if there's a page loaded
        if (this._app.getActiveNav().canGoBack()){ 
          this._app.getActiveNav().pop();
        };

        // Navigate back on subloaded nav if notified
        if(this._innerNavCtrl && this._innerNavCtrl.canGoBack()){
          this._innerNavCtrl.pop();
        }

      };

      // Fake browser history on each view enter
      this._app.viewDidEnter.subscribe((app) => {
        history.pushState (null, null, "");
      });

    }
  }

}
