import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';


// Start Pages [Logged Out]
import { LoginPage } from '../pages/start-pages/login/login';
import { RegisterPage } from '../pages/start-pages/register/register';
import { ForgotPasswordPage } from '../pages/start-pages/forgot-password/forgot-password';

// Main Navigation once Logged In
import { NavigationPage } from '../pages/navigation/navigation';
import { AddAccountPage } from '../pages/add-account/add-account';

// Account Management Pages via Conversation / Media View
import { AccountTabsPage } from '../pages/account/account-tabs/account-tabs';
import { ConversationPage } from '../pages/account/conversation/conversation';
import { MediaPage } from '../pages/account/media/media';

// Providers / Services
import { AuthService } from '../providers/auth.service'
import { KeyboardService } from '../providers/keyboard.service'
import { ConfigService } from '../providers/config.service'
import { AccountService } from '../providers/account.service'

export const pages = [
    MyApp,

    // Main Nav Page [Logged In]
    NavigationPage,
    AddAccountPage,

    // Account Mgmt Pages Media/Conv View 
    AccountTabsPage,
    ConversationPage,
    MediaPage,

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
    ConfigService, //Handles Environment-specific Variables
    AccountService //Manages Instagram Accounts assigned to Agent
  ],
  bootstrap: [IonicApp]
})
export class AppModule {}
