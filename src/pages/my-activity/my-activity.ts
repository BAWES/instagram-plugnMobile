import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ActivityService } from '../../providers/logged-in/activity.service';

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
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    // Load and populate media detail
    this._loadActivity();
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
