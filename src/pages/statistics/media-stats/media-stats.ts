import 'chart.js/src/chart';
declare var Chart;
import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Events } from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';
import { HardwareBackButtonService } from '../../../providers/hardwarebackbtn.service';

/*
  Media Stats Page
*/
@Component({
  selector: 'page-media-stats',
  templateUrl: 'media-stats.html'
})
export class MediaStatsPage {

  @ViewChild('canvas') canvas:ElementRef;

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    private _events: Events,
    private _backBtn: HardwareBackButtonService
    ) {}

  /**
   * Runs when the page has loaded. This event only happens once 
   * per page being created. If a page leaves but is cached,
   * then this event will not fire again on a subsequent viewing.
   */
  ionViewDidLoad(){
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

    // Setup Back Button Behavior
    this._backBtn.callbackOnBack(() => {
      this._backBtn.clearBackFunctionality();
      this.navCtrl.pop();
    });
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
                data: this.accounts.statsMediaArray,
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