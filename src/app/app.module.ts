import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';

// Providers / Services
import { AuthService } from '../providers/auth.service'

export const pages = [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage
  ];

@NgModule({
  declarations: pages,
  entryComponents: pages,
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  providers: [
    AuthService
  ],
  bootstrap: [IonicApp]
})
export class AppModule {}
