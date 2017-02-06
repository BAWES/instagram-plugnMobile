import { Component } from '@angular/core';
import { MenuController, NavController, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-tutorial-inner',
  templateUrl: 'tutorial-inner.html'
})
export class TutorialInnerPage {

  constructor(
    public navCtrl: NavController, 
    private _viewCtrl: ViewController,
    public menu: MenuController
    ) {}

  /**
   * Close the page
   */
  close(){
    this._viewCtrl.dismiss();
  }

}
