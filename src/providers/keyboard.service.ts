import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';

import { Platform } from 'ionic-angular';
import { Keyboard } from 'ionic-native';

/*
  Handles Keyboard functions
*/
@Injectable()
export class KeyboardService {

  public isKeyboardOpen = false;
  public keyboardHeight = 0;

  constructor(private _platform: Platform) {
    /**
     * Initialize Keyboard service if this is a native device
     */
    _platform.ready().then(() => {
      if (_platform.is('cordova')) {
        this.initialize();
      }
    });
  }

  initialize(){
    // Subscribe to Keyboard Visible Events
    Keyboard.onKeyboardShow().subscribe(e => {
      this.isKeyboardOpen = true;
      this.keyboardHeight = e.keyboardHeight;
    });

    // Subscribe to Keyboard Closed Events
    Keyboard.onKeyboardHide().subscribe(e => {
      this.isKeyboardOpen = false;
    });
  }

}
