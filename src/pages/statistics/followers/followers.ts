import 'chart.js/src/chart';
declare var Chart;
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Events, MenuController } from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';
import { AnalyticsService } from '../../../providers/analytics.service';

/*
  Followers Page
*/
@Component({
  selector: 'page-followers',
  templateUrl: 'followers.html'
})
export class FollowersPage {

  @ViewChild('canvas') canvas:ElementRef;

  // Variable storing event handlers to unsubscribe from before page leaves
  private _accountSwitchHandler;

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService,
    private _analytics: AnalyticsService,
    private _menuCtrl: MenuController
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    this._analytics.trackView("Stats: Followers");

    // Load this account stats if not already loaded
    this.accounts.loadAccountStats();

    // Render the chart after data ready
    if(this.accounts.activeAccountStats){
      this.renderChart();
    }else{
      this._events.subscribe("chartdata:ready", () => {
        this.renderChart();
      });
    }

    // Disable Swipe on Right Menu
    this._menuCtrl.swipeEnable(false, "right");

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
      this._backBtn.toggleMenuOnBack();
    });

    // Subscribe to Pop this page off on account change
    this._events.subscribe("account:switching", this._accountSwitchHandler = (eventData) => {
      this.navCtrl.popToRoot();
    });
  }
  /**
   * Page is leaving
   */
  ionViewWillLeave(){
    // Unsubscribe
    this._events.unsubscribe("account:switching", this._accountSwitchHandler);
    // Enable Swipe on Right Menu
    this._menuCtrl.swipeEnable(true, "right");
  }

  /**
   * Render the chart
   */
  renderChart(){
    // Hide the chart Legend
    Chart.defaults.global.legend.display = false;

    // Get the Canvas
    let ctx = this.canvas.nativeElement;
    // Prepare the data
    let data = {
        labels: this.accounts.statsDatesArray,
        datasets: [
            {
                data: this.accounts.statsFollowersArray,
                // Colors
                backgroundColor: 'rgba(148,159,177,0.2)',
                borderColor: 'rgba(148,159,177,1)',
                pointBackgroundColor: 'rgba(148,159,177,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            }
        ]
    };

    // Create the chart
    new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        animation: false,
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  

}