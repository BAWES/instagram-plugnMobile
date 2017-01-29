import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Deploy } from '@ionic/cloud-angular';
import { Platform, Events, ToastController, AlertController, IonicApp, App, MenuController, Nav } from 'ionic-angular';
import { StatusBar, OneSignal, Deeplinks } from 'ionic-native';

import { NavigationPage } from '../pages/navigation/navigation';
import { LoginPage } from '../pages/start-pages/login/login';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { AuthService } from '../providers/auth.service';
import { KeyboardService } from '../providers/keyboard.service';

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class MyApp implements OnInit{
  rootPage: any;
  @ViewChild(Nav) navChild:Nav;

  constructor(
    public deploy: Deploy,
    private _platform: Platform,
    private _auth: AuthService,
    private _keyboard: KeyboardService,
    private _events: Events,
    private _alertCtrl: AlertController,
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

        // Check for App update via Ionic Deploy
        this._checkForUpdate();

        // Push Notification Setup via OneSignal
        this._setupPushNotifs();
      }

      if (this._platform.is('ios')) {
        this._keyboard.disableScroll();
      }

      // Fix back button behavior on browser
      this._setupBrowserBackButtonBehavior();

      let tutorialShown = localStorage.getItem("tutorialShown");

      // Figure out which page to load on app start [Based on Auth]
      if(this._auth.isLoggedIn){
        this.rootPage = NavigationPage;
      }else if(tutorialShown != "true"){
        // Show Tutorial
        this.rootPage = TutorialPage;
      }else{
        this.rootPage = LoginPage;
      }

      this._handleDeeplinks();

    });
  }

  /**
   * Check for app updates on the deploy channel
   */
  private _checkForUpdate(){
    this.deploy.channel = 'production';
    this.deploy.check().then((hasUpdate: boolean) => {
      if (hasUpdate) {
        // Show Toast with Download Progress
        let toast = this._toastCtrl.create({
                        message: 'Downloading Update .. 0%',
                        position: 'bottom',
                        showCloseButton: false,
                    });
        toast.present();

        // update is available, download and extract the update
        this.deploy.download({
            onProgress: p => {
                toast.setMessage('Downloading Update .. ' + p + '%');
                //console.log('Downloading = ' + p + '%');
            }
        }).then(() => {
          this.deploy.extract({
              onProgress: p => {
                  toast.setMessage('Extracting .. ' + p + '%');
                  //console.log('Extracting = ' + p + '%');
              }
          }).then(() => {
            // Reload App after 3 seconds
            toast.setMessage('Restart app to apply update');
            setTimeout(() => {
              this.deploy.load();
            }, 3000);

            // Get info about the currently active snapshot 
            this.deploy.info().then((info: {deploy_uuid: string, binary_version: string}) => {
              
              let activeSnapshot = info.deploy_uuid;

              // List of snapshots applied on this device.
              this.deploy.getSnapshots().then((snapshots) => {
                // Loop through Existing snapshots and delete the inactive ones
                snapshots.forEach(snapshot => {
                  if(snapshot != activeSnapshot){
                    this.deploy.deleteSnapshot(snapshot).then(() => {
                      // Reload app to apply the update
                      return this.deploy.load();
                    });
                  }
                });
              });
            });
          });
        });
      }
    });
  }

  /**
   * Handle Deep Linking to the App
   */
  private _handleDeeplinks(){
    // Leave if not cordova
    if (!this._platform.is('cordova')) return;

    let rootPageToLoad:any = LoginPage;
    if(this._auth.isLoggedIn){
      rootPageToLoad = NavigationPage;
    }

    Deeplinks.routeWithNavController(this.navChild, {
        //'/app': rootPageToLoad, //Not loading the app deeplink to not trigger back behavior
      }).subscribe((match) => {
        // Handle Deeplinks to Verify Email 
        let url = match.$link.url;
        let path = match.$link.path;
        //let queryString = match.$link.queryString;

        // Is user attempting to verify email?
        if(path == '/deeplink/email-verify'){
          const code = this._getParameterByName('code', url);
          const verify = +this._getParameterByName('verify', url);
          this._attemptVerifyEmail(code,verify);
        }

      }, (nomatch) => {
        // nomatch.$link - the full link data
        //console.warn('Unmatched Route', nomatch);
      });
  }

  /**
   * Parse URL for given variable name
   */
  private _getParameterByName(name: string, url: string) {
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  /**
   * Attempt to Verify Email with supplied code and verify id.
   */
  private _attemptVerifyEmail(code: string, verify: number){
    console.log("attempting to verify");
    this._auth.verifyEmail(code, verify).subscribe(response => {
      console.log("response", response.message);
      let alert = this._alertCtrl.create({
        title: 'Email Verification',
        subTitle: response.message,
        buttons: ['Ok']
      });
      alert.present();
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
