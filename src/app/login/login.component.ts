import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SharedService } from '../shared/shared.service';
import { ApiResponse } from '../types';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Output() onLogin = new EventEmitter();
  @ViewChild('passwordField') passwordField: ElementRef;
  // showSpinner: number = 0;
  userName = '';
  password = '';
  showForgotPassword = false;
  showSpinner = false;

  constructor(
    private shared: SharedService,
    private http: HttpClient) { }

  ngOnInit() {

  }

  login() {
    const userName = this.userName.trim();
    if (userName.length < 3) {
      this.shared.openMessageDialog('Data Entry Error', 'Please enter a valid User Name');
      return;
    }
    const password = this.password.trim();
    if (password.length < 3) {
      this.shared.openMessageDialog('Data Entry Error', 'Please enter a valid Password');
      return;
    }
    this.showSpinner = true;
    const params =
      new HttpParams()
      .append('application', this.shared.appInit.application.toString())
      .append('user', userName)
      .append('password', this.password);
    this.http.get(
      this.shared.appInit.authPath + 'appAuthentication/login',
      {params, withCredentials: false}).subscribe((response: ApiResponse) => {
        this.showSpinner = false;
        if (response.errorMessage) {
          this.shared.openMessageDialog('Data Access Error', response.errorMessage);
          return;
        }
        const data = JSON.parse(response.body);
        if (data.status === 'OK') {
          this.shared.appUser = data.permissions;
          this.shared.appUser.fleets = data.permissions.fleets;
          this.shared.appUser.identity = {
            token: data.identity.Token,
            identityId: data.identity.IdentityId
          };
          localStorage.setItem('identityToken', data.identity.Token);
          localStorage.setItem('sessionId', data.permissions.sessionId);
          this.onLogin.emit();
        } else if (data.status === 'NO_AUTH' || data.status === 'NOT_FOUND') {
          this.shared.openMessageDialog('Login Not Successful', 'Please check your User Name and Password and try again.');
        } else if (data.status === 'ERROR') {
          this.shared.openMessageDialog('Login Error', 'Please contact the taxi company, you have your account with');
        } else {
          this.shared.openMessageDialog('Unexpected Response', 'Please contact NTS');
        }
      }, error => {
        this.showSpinner = false;
        this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
      });
  }

  userNameKeyUp(event: any) {
    if (event.which === 13) {
      this.passwordField.nativeElement.focus();
    }
  }

  passwordKeyUp(event: any) {
    if (event.which === 13) {
      this.login();
    }
  }

  passwordReset() {
    this.showSpinner = true;
    this.userName = this.userName.trim();
    const params =
    new HttpParams()
    .append('userId', this.userName)
    .append('requestresetpassword', 'true')
    .append('application', this.shared.appInit.application.toString());
    this.http.get(this.shared.appInit.apiPath + 'resetpassword',
    {params, withCredentials: false}).subscribe((response: ApiResponse) => {
      this.showSpinner = false;
      if (response.errorMessage) {
        this.shared.openMessageDialog('Something Went Wrong', 'Please try again');
        return;
      }
      const data = JSON.parse(response.body);
      if (data.status === 'OK') {
        this.shared.openMessageDialog('Password Reset Request Submitted',
        'Please check your email for your confirmation to reset your password and follow the steps given.');
        this.showForgotPassword = false;
      } else {
        this.shared.openMessageDialog('We could not find your account', 'Please check your User Name and try again');
      }

    }, error => {
      this.showSpinner = false;
      this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
    });
  }
}
