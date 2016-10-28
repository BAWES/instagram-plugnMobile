import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

// Inner Pages
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
// Start Pages
import { LoginPage } from '../pages/start-pages/login/login';
import { RegisterPage } from '../pages/start-pages/register/register';

// Providers / Services
import { AuthService } from '../providers/auth.service'
import { KeyboardService } from '../providers/keyboard.service'

export const pages = [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,

    // Start-Pages
    LoginPage,
    RegisterPage
  ];

@NgModule({
  declarations: pages,
  entryComponents: pages,
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  providers: [
    AuthService,
    KeyboardService
  ],
  bootstrap: [IonicApp]
})
export class AppModule {}
