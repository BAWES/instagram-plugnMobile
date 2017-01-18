import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { AuthService } from '../../providers/auth.service';
import { ConfigService } from '../../providers/config.service';
import { AnalyticsService } from '../../providers/analytics.service';

/*
  Class for the add-account page.
*/
@Component({
  selector: 'page-add-account',
  templateUrl: 'add-account.html'
})
export class AddAccountPage {

  private _browser: InAppBrowser;

  constructor(
    public navCtrl: NavController, 
    public auth: AuthService,
    private _analytics: AnalyticsService,
    private _config: ConfigService
    ) {}

  ionViewDidEnter() {
    this._analytics.trackView("Add Account Page");
  }

  ionViewDidLoad() {
    //console.log('Hello Add Account Page');
  }

  /**
   * Load Specified Url
   */
  loadUrl(url: string){
    this._browser = new InAppBrowser(url, this._config.browserTarget, this._config.browserOptions);
  }

}
