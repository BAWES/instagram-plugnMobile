import { Injectable } from '@angular/core';

import { Platform, Events } from 'ionic-angular';
import { Keyboard } from 'ionic-native';

/*
  Handles Keyboard functions
*/
@Injectable()
export class KeyboardService {

  public isKeyboardOpen = false;
  public keyboardHeight = 0;

  constructor(private _platform: Platform, private _events: Events) {
    /**
     * Initialize Keyboard service if this is a native device
     */
    _platform.ready().then(() => {
      if (_platform.is('cordova') && _platform.is('mobile')) {
        this.initialize();
      }
      if (_platform.is('ios')) {
        this.disableScroll();
      }
    });
  }

  open(){
    if (this._platform.is('cordova') && this._platform.is('mobile')) {
      Keyboard.show();
    }
  }

  disableScroll(){
    if (this._platform.is('cordova') && this._platform.is('mobile')) {
      Keyboard.disableScroll(true);
    }
  }

  enableScroll(){
    if (this._platform.is('cordova') && this._platform.is('mobile')) {
      Keyboard.disableScroll(false);
    }
  }

  initialize(){
    // Subscribe to Keyboard Visible Events
    Keyboard.onKeyboardShow().subscribe(e => {
      this.isKeyboardOpen = true;
      this.keyboardHeight = e.keyboardHeight;
      document.body.classList.add('keyboard-is-open');

      // Publish event that keyboard opened
      this._events.publish('keyboard:toggle', "open");
    });

    // Subscribe to Keyboard Closed Events
    Keyboard.onKeyboardHide().subscribe(e => {
      this.isKeyboardOpen = false;
      document.body.classList.remove('keyboard-is-open');

      // Publish event that keyboard opened
      this._events.publish('keyboard:toggle', "close");
      
    });
  }

}
