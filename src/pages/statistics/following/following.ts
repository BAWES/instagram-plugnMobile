import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';

import { AccountService } from '../../../providers/logged-in/account.service';

/*
  Following Page
*/
@Component({
  selector: 'page-following',
  templateUrl: 'following.html'
})
export class FollowingPage {

  // lineChart
  public lineChartData:Array<any> = [
    {data: this.accounts.statsFollowingArray}
  ];
  public lineChartOptions:any = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false
  };
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = false;
  public lineChartType:string = 'line';

  constructor(
    public navCtrl: NavController,
    public accounts: AccountService,
    ) {}

  /**
   * On Page Enter
   */
  ionViewDidEnter() {
    // Load this account stats if not already loaded
    this.accounts.loadAccountStats();
  }

  

}