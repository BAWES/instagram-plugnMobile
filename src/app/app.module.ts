import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

// Inner Pages
import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { NavigationPage } from '../pages/navigation/navigation';
// Start Pages
import { LoginPage } from '../pages/start-pages/login/login';
import { RegisterPage } from '../pages/start-pages/register/register';
import { ForgotPasswordPage } from '../pages/start-pages/forgot-password/forgot-password';

// Providers / Services
import { AuthService } from '../providers/auth.service'
import { KeyboardService } from '../providers/keyboard.service'
import { ConfigService } from '../providers/config.service'

export const pages = [
    MyApp,

    // App Pages
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    NavigationPage,

    // Start-Pages
    LoginPage,
    RegisterPage,
    ForgotPasswordPage
  ];

@NgModule({
  declarations: pages,
  entryComponents: pages,
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  providers: [
    AuthService, //Handles all Authorization
    KeyboardService, //Handles all Keyboard Activity
    ConfigService //Handles Environment-specific Variables
  ],
  bootstrap: [IonicApp]
})
export class AppModule {}
