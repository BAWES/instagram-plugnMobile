import {Injectable} from '@angular/core';
import {GoogleAnalytics} from 'ionic-native';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
declare var window;

/*
  Handles Google Analytics
*/
@Injectable()
export class AnalyticsService {

eventsNotSent:any[] = new Array();
trackerInitialized:boolean = false;

trackView(viewName:string) {
    if (typeof window.analytics === 'undefined') {
        this.eventsNotSent.push({viewName: viewName});
    } else {
        this.initGoogleAnalytics().then(() => {
            this.trackEventsNotSent().then(() => {
                GoogleAnalytics.trackView(viewName).then(() => {
                    // Do nothing
                });
            });
        }, (error: any) => {
            this.eventsNotSent.push({viewName: viewName});
        });
    }
}

 private trackEventsNotSent():Promise<{}> {
    return new Promise((resolve) => {
        if (this.eventsNotSent == null || Object.keys(this.eventsNotSent).length === 0) {
            resolve();
        } else {
            let promises = new Array();

            for (let i: number = 0; i < this.eventsNotSent.length; i++) {
                    promises.push(GoogleAnalytics.trackView(this.eventsNotSent[i].viewName));
            }

            Observable.forkJoin(promises).subscribe(
                (data:any) => {
                    this.eventsNotSent = new Array();
                    resolve();
                });
        }
    });
}

private initGoogleAnalytics():Promise<{}> {
    return new Promise((resolve, reject) => {
        if (this.trackerInitialized) {
            resolve();
        } else {
                GoogleAnalytics.startTrackerWithId('UA-80731173-2').then(() => {
                      this.trackerInitialized = true;
                        resolve();
            }).catch((error: any) => {
                // Do nothing
                this.trackerInitialized = false;
                reject(error);
            });
        }
    });
   }
 }