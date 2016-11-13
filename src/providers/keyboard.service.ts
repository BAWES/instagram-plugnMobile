import { Injectable, ApplicationRef } from '@angular/core';

import { Platform } from 'ionic-angular';
import { Keyboard } from 'ionic-native';

/*
  Handles Keyboard functions
*/
@Injectable()
export class KeyboardService {

  public isKeyboardOpen = false;
  public keyboardHeight = 0;

  constructor(private ref:ApplicationRef, private _platform: Platform) {
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
      document.body.classList.add('keyboard-is-open');

      // Force Change Detection in Angular
      this.ref.tick();
    });

    // Subscribe to Keyboard Closed Events
    Keyboard.onKeyboardHide().subscribe(e => {
      this.isKeyboardOpen = false;
      document.body.classList.remove('keyboard-is-open');

      // Force Change Detection in Angular
      this.ref.tick();
    });
  }

}
