import { Component, OnInit, NgZone } from '@angular/core';
import { Platform, Events, ToastController, IonicApp, App, MenuController } from 'ionic-angular';
import { StatusBar, OneSignal } from 'ionic-native';

import { NavigationPage } from '../pages/navigation/navigation';
import { LoginPage } from '../pages/start-pages/login/login';

import { AuthService } from '../providers/auth.service';
import { KeyboardService } from '../providers/keyboard.service';

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp implements OnInit{
  rootPage: any;

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

      if (this._platform.is('cordova') && this._platform.is('mobile')) {
        StatusBar.styleDefault();

        // Push Notification Setup via OneSignal
        this._setupPushNotifs();
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
   * Setup push notification service via OneSignal
   */
  private _setupPushNotifs(){
    // Setup Push Notifications via OneSignal
    OneSignal.startInit('6ca2c182-dda4-4749-aed6-0b4310188986', '882152609344');
    OneSignal.inFocusDisplaying(OneSignal.OSInFocusDisplayOption.Notification);
    OneSignal.setSubscription(true);


    // OneSignal.handleNotificationReceived().subscribe(() => {
    // // do something when notification is received
    // });

    OneSignal.handleNotificationOpened().subscribe((data) => {
      // When a Notification is Opened
      if(data.notification.groupedNotifications){
        // Notification Grouped [on Android]
        let firstNotificationData = data.notification.groupedNotifications[0].additionalData;
        this._events.publish("notification:grouped", firstNotificationData);
      }else if(data.notification.payload){
        // A single notification clicked
        let notificationData = data.notification.payload.additionalData;
        this._events.publish("notification:single", notificationData);
      }
    });

    OneSignal.endInit();

    // OneSignal.getIds().then(data => {
    //   // this gives you back the new userId and pushToken associated with the device. Helpful.
    // });
  }


  /**
   * Using Ng2 Lifecycle hooks because view lifecycle events don't trigger for Bootstrapped MyApp Component
   */
  ngOnInit(){
    // On Login Event, set root to Internal app page
    this._events.subscribe('user:login', (userEventData) => {
      this._zone.run(() => {
        this.rootPage = NavigationPage;
      });

      // Create Tags on OneSignal for this user
      if (this._platform.is('cordova') && this._platform.is('mobile')) {
        OneSignal.sendTags({
          "agentId": this._auth.agentId,
          "name": this._auth.name,
          "email": this._auth.email
        });
      }

    });

    // On Logout Event, set root to Login Page
    this._events.subscribe('user:logout', (userEventData) => {
      // Set root to Login Page
      this.rootPage = LoginPage;

      // Delete Tags on OneSignal for this user
      if (this._platform.is('cordova') && this._platform.is('mobile')) {
        OneSignal.deleteTags(['agentId', 'name', 'email']);
      }

      // Show Toast Message explaining logout reason if there's one set
      let logoutReason = userEventData;
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

      };

      // Fake browser history on each view enter
      this._app.viewDidEnter.subscribe((app) => {
        history.pushState (null, null, "");
      });

    }
  }

}
