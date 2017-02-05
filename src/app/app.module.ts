import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

import { MyApp } from './app.component';

// Start Pages [Logged Out]
import { TutorialPage } from '../pages/tutorial/tutorial';
import { TutorialInnerPage } from '../pages/tutorial-inner/tutorial-inner';
import { LoginPage } from '../pages/start-pages/login/login';
import { RegisterPage } from '../pages/start-pages/register/register';
import { ForgotPasswordPage } from '../pages/start-pages/forgot-password/forgot-password';

// Main Navigation once Logged In
import { NavigationPage } from '../pages/navigation/navigation';
import { AddAccountPage } from '../pages/add-account/add-account';
import { InternetOfflinePage } from '../pages/internet-offline/internet-offline';
import { NotePage } from '../pages/note/note';
import { MyActivityPage } from '../pages/my-activity/my-activity';

// Account Management Pages via Conversation / Media View
import { AccountTabsPage } from '../pages/account/account-tabs/account-tabs';
import { ConversationPage } from '../pages/account/conversation/conversation';
import { ConversationDetailPage } from '../pages/account/conversation-detail/conversation-detail';
import { MediaPage } from '../pages/account/media/media';
import { MediaDetailPage } from '../pages/account/media-detail/media-detail';

// Account Stats Pages and options available on Right Menu
import { AgentActivityPage } from '../pages/statistics/agent-activity/agent-activity';
import { AgentsPage } from '../pages/statistics/agents/agents';
import { MediaStatsPage } from '../pages/statistics/media-stats/media-stats';
import { FollowingPage } from '../pages/statistics/following/following';
import { FollowersPage } from '../pages/statistics/followers/followers';

// Directives 
import { Autosize } from '../directives/autosize/autosize';
import { KeyboardAttachDirective } from '../directives/keyboard-attach/keyboard-attach';

// Components 
import { CommentComponent } from '../components/comment/comment';

// Providers / Services
import { AuthService } from '../providers/auth.service';
import { KeyboardService } from '../providers/keyboard.service';
import { HardwareBackButtonService } from '../providers/hardwarebackbtn.service';
import { ConfigService } from '../providers/config.service';
import { AnalyticsService } from '../providers/analytics.service';

import { AuthHttpService } from '../providers/logged-in/authhttp.service';
import { AccountService } from '../providers/logged-in/account.service';
import { MediaService } from '../providers/logged-in/media.service';
import { ConversationService } from '../providers/logged-in/conversation.service';
import { CommentService } from '../providers/logged-in/comment.service';
import { ActivityService } from '../providers/logged-in/activity.service';
import { AgentService } from '../providers/logged-in/agent.service';
import { AssignmentService } from '../providers/logged-in/assignment.service';
import { NoteService } from '../providers/logged-in/note.service';

export const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '7e4f1778'
  }
};

export const pages = [
  MyApp,

  // Main Nav Page [Logged In]
  NavigationPage,
  AddAccountPage,
  InternetOfflinePage,
  MyActivityPage,
  NotePage,

  // Account Mgmt Pages Media/Conv View 
  AccountTabsPage,
  ConversationPage,
  ConversationDetailPage,
  MediaPage,
  MediaDetailPage,

  // Statistics Pages
  AgentActivityPage,
  AgentsPage,
  MediaStatsPage,
  FollowingPage,
  FollowersPage,

  // Start-Pages
  TutorialPage,
  TutorialInnerPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage
];

export const toDeclare = [
  /**
   * Directives
   */
  Autosize,
  KeyboardAttachDirective,

  /**
   * Components
   */
  CommentComponent,

  /**
   * Pages >> Paste Pages Definition Above Under Here
   */
  MyApp,

  // Main Nav Page [Logged In]
  NavigationPage,
  AddAccountPage,
  InternetOfflinePage,
  MyActivityPage,
  NotePage,

  // Account Mgmt Pages Media/Conv View 
  AccountTabsPage,
  ConversationPage,
  ConversationDetailPage,
  MediaPage,
  MediaDetailPage,

  // Statistics Pages
  AgentActivityPage,
  AgentsPage,
  MediaStatsPage,
  FollowingPage,
  FollowersPage,

  // Start-Pages
  TutorialPage,
  TutorialInnerPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage
];

@NgModule({
  declarations: toDeclare,
  entryComponents: pages,
  imports: [
    IonicModule.forRoot(MyApp, {
      // Global Config
      tabsHideOnSubPages: true,
      //mode: "ios",

      // Platform Specific Config
      platforms : {
          ios : {
            scrollAssist: false,    // Valid options appear to be [true, false]
            autoFocusAssist: false  // Valid options appear to be ['instant', 'delay', false]
          }
      }
    }),
    CloudModule.forRoot(cloudSettings)
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService, //Handles all Authorization
    KeyboardService, //Handles all Keyboard Activity
    HardwareBackButtonService, //Handles Hardware back button
    ConfigService, //Handles Environment-specific Variables
    AnalyticsService, // Handles Google Analytics
    AuthHttpService, //Handles all Authorized HTTP functions with Bearer Token
    
    AccountService, //Manages Instagram Accounts assigned to Agent
    MediaService, //Manage Media for accounts
    ConversationService, // Manages Conversations for accounts
    CommentService, // Handle Comment Posting and Deletion
    ActivityService, // Agent Activity on Accounts
    AgentService, // Agent Profile and Actions on it
    AssignmentService, // Manage Agent Assignments to Accounts
    NoteService // Note on users / CRM
  ],
  bootstrap: [IonicApp]
})
export class AppModule {}
