import { Injectable } from '@angular/core';

import { Platform } from 'ionic-angular';

/*
  Handles all Environment-based config
*/
@Injectable()
export class ConfigService {

  // Endpoint Urls
  public apiBaseUrl: string;

  constructor(private _platform: Platform) {
    // Initiate dev environment on computer while 
    // running the production on mobile
    _platform.ready().then(() => {
      if (_platform.is('cordova')) {
        this.initProdEnvironment();
      }else{
        this.initDevEnvironment();
      }
    });
    
  }
  
  /**
   * Initialize the Dev Environment
   */
  initDevEnvironment(){
    this.apiBaseUrl = "http://localhost/~BAWES/plugn/api/web/v1";
  }

  /**
   * Initialize the Production Environment
   */
  initProdEnvironment(){
    this.apiBaseUrl = "https://api.plugn.io/v1";
  }

}
