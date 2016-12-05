import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';

import { ActivityService } from '../../providers/logged-in/activity.service';
import { HardwareBackButtonService } from '../../providers/hardwarebackbtn.service';

/*
  Class for the my-activity page.
*/
@Component({
  selector: 'page-my-activity',
  templateUrl: 'my-activity.html'
})
export class MyActivityPage {

  public isLoading = true;
  public myActivity; // Loaded activity data

  constructor(
    public navCtrl: NavController,
    public activityService: ActivityService,
    private _backBtn: HardwareBackButtonService,
    private _menuCtrl: MenuController
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    // Load and populate media detail
    this._loadActivity();

    // Disable Swipe on Right Menu
    this._menuCtrl.swipeEnable(false, "right");

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
    });
  }
  /**
   * Page is leaving
   */
  ionViewWillLeave(){
    // Enable Swipe on Right Menu
    this._menuCtrl.swipeEnable(true, "right");
  }


  /**
   * Load Personal Activity for the logged in Agent
   */
  private _loadActivity(){
    this.isLoading = true;
    this.activityService
        .getPersonalActivity()
        .subscribe(jsonResponse => {
          this.isLoading = false;
          this.myActivity = jsonResponse;
        });
  }

}
