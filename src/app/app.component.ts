import { Component, OnInit } from '@angular/core';
import { SharedService } from './shared/shared.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppInitData } from './shared/app-init.model';
import { Router, ActivatedRoute } from '@angular/router';
import { UserData } from './shared/user.model';
import { PageData } from './shared/page.model';
import { ApiResponse } from './shared/api.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  isLoggedIn = false;
  appInit: AppInitData;
  completingRegistration = false;
  resetPassword = false;
  userMenuActive = false;
  showSpinner = false;
  appUser: UserData;
  gettingSession = true;
  pageId = 1;
  pages: PageData[] = [
    {id: 1, name: 'Home', path: ['home']},
    {id: 2, name: 'User Profile', path: ['user-profile']},
  ];


  constructor(
  private shared: SharedService,
  private http: HttpClient,
  private router: Router,
  private route: ActivatedRoute) {}

  onLogin() {
    this.isLoggedIn = true;
    this.appUser = this.shared.appUser;
    this.onNavigate(1);
  }

  onLogout() {
    this.showSpinner = true;
    const params =
      new HttpParams()
      .append('application', this.shared.appInit.application.toString())
      .append('identityId', this.shared.appUser.identity.identityId)
      .append('user', this.shared.appUser.userId);
    this.http.get(
      this.shared.appInit.authPath + 'appAuthentication/logout',
      {params, withCredentials: false }).subscribe((response: ApiResponse) => {
        this.showSpinner = false;
        if (response.errorMessage) {
          this.shared.openMessageDialog('Data Access Error', response.errorMessage);
          return;
        }
        const data = JSON.parse(response.body);
        if (data.status === 'IDENTITY_DELETED') {
          localStorage.removeItem('identityToken');
          localStorage.removeItem('sessionId');
          this.isLoggedIn = false;
          this.router.navigate(['/']);
        }
      }, error => {
        this.showSpinner = false;
        this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
      });
  }

  ngOnInit() {
    this.shared.resetPasswordSet.subscribe(() => {
      this.resetPassword = false;
    });
    this.shared.authenticationError.subscribe(() => {
      localStorage.removeItem('identityToken');
      localStorage.removeItem('sessionId');
      this.isLoggedIn = false;
    });
    this.http.get('assets/files/app-init-prod.json').subscribe(
      (data: AppInitData) => {
        this.appInit = data;
        this.initializeShared();

        const identityToken = localStorage.getItem('identityToken');
        const sessionId = localStorage.getItem('sessionId');
        if (identityToken && sessionId) {
          const params =
        new HttpParams()
        .append('application', this.shared.appInit.application.toString())
        .append('identityToken', identityToken)
        .append('sessionId', sessionId);

          this.http.get(
          this.shared.appInit.authPath + 'appAuthentication/getsession',
          {params, withCredentials: false}).subscribe((response: ApiResponse) => {
            if (response.errorMessage) {
              this.gettingSession = false;
            } else {
              const sessionData = JSON.parse(response.body);
              if (sessionData.status === 'OK') {
                this.shared.appUser = sessionData.permissions;
                this.shared.appUser.fleets = sessionData.permissions.fleets;
                this.shared.appUser.identity = {
                  token: sessionData.identity.Token,
                  identityId: sessionData.identity.IdentityId
                };
                this.appUser = this.shared.appUser;
                this.gettingSession = false;
                this.isLoggedIn = true;
                if (window.location.pathname === '/') {
                  this.onNavigate(1);
                }
              } else {
                this.gettingSession = false;
              }
            }
          });
        } else {
          this.gettingSession = false;
        }
      });
  }

  initializeShared() {
    this.shared.appInit = this.appInit;
    // check for account registration completion or password reset
    this.route.queryParams.subscribe((params) => {
      if (params.resetPassword) {
        this.resetPassword = true;
        this.shared.secret = params.secret;
        this.router.navigate(['reset-password']);
        return;
      }
    });

  }

  onNavigate(pageId: number) {
    const page = this.getPage(pageId, true);
    this.router.navigate(page.path);
  }

  getPage(pageId: number, selectPage: boolean = false) {
    const page = this.pages.find((pg) =>  pg.id === pageId);
    if (selectPage) {
      this.pageId = pageId;
    }
    return page;
}
}
