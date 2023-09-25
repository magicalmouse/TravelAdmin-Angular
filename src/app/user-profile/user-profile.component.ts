import { Component, OnInit } from '@angular/core';
import { UserData } from '../shared/user.model';
import { SharedService } from '../shared/shared.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ApiResponse } from '../shared/api.model';



@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
    appUser: UserData;
    currentPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
    firstName: string;
    lastName: string;
    showSpinner: boolean;

    constructor(
        private shared: SharedService,
        private http: HttpClient,
        public dialog: MatDialog,
        private router: Router) {}


    ngOnInit() {
        this.appUser = this.shared.appUser;
        this.firstName = this.appUser.firstName;
        this.lastName = this.appUser.lastName;
    }

    onUpdate() {
        let params = new HttpParams()
          .append('zone', this.appUser.zoneId)
          .append('updateAction', '1')
          .append('token', this.appUser.identity.token)
          .append('userId', this.appUser.userId)
          .append('application', this.shared.appInit.application.toString());
        let changes = false;

        // check to see if all the necessary information for resettting the password
        // exists and then verify that the new password is valid
        if (this.currentPassword && this.newPassword && this.newPasswordConfirm) {
            const passwordValid = this.checkPassword();
            if (passwordValid) {
              params = params.append('currentPassword', this.currentPassword);
              params = params.append('newPassword', this.newPassword);
              changes = true;
            }
        } else if (this.currentPassword || this.newPassword || this.newPasswordConfirm) {
          let errors = ``;
          if (!this.currentPassword) {
            errors += `<p>Must enter current password.</p>`;
          }
          if (!this.newPassword) {
            errors += `<p>Must enter new password. </p>`;
          }
          if (!this.newPasswordConfirm) {
            errors += `<p>Must confirm new password.</p>`;
          }
          this.shared.openMessageDialog('Data Entry Error', errors);
          return;
        }

        // checks to see if the first or last name has been changed
        if ( (this.firstName !== this.appUser.firstName) || (this.lastName !== this.appUser.lastName)) {
          params = params.append('firstName', this.firstName);
          params = params.append('lastName', this.lastName);
          changes = true;
        }

        if (changes) {
          // if either the password or first and/or last names have been changed,
          // send a request to the server
          this.showSpinner = true;
          this.http.get(
            this.shared.appInit.apiPath + 'userprofile',
            {params, withCredentials: false}).subscribe((response: ApiResponse) => {
              this.showSpinner = false;
              if (response.errorMessage) {
                this.shared.openMessageDialog('Data Access Error', response.errorMessage);
                return;
              }
              const data = JSON.parse(response.body);
              if (data.status === 'OK') {
                if (data.firstName && data.lastName) {
                  this.shared.appUser.firstName = data.firstName;
                  this.shared.appUser.lastName = data.lastName;

                }
                this.newPassword = null;
                this.currentPassword = null;
                this.newPasswordConfirm = null;
                this.shared.openMessageDialog('Update Successful', 'Your changes have been saved and your profile has been updated.');
              } else if (data.status === 'AUTHENTICATION_ERROR') {
                this.shared.authenticationErrorReturned();
                this.router.navigate(['/']);
              } else {
                this.shared.openMessageDialog('Update Error', data.error);
              }

            }, error => {
              this.showSpinner = false;
              this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
            });
        }
      }

      checkPassword() {
        const p = this.newPassword.trim();
        const pp = this.newPasswordConfirm.trim();
        if (p.length < 8) {
          this.shared.openMessageDialog('Data Entry Error', 'Password must be at least 8 characters long');
          return false;
        } else if (p.search(/[0-9]/) < 0 ||
                   p.search(/[a-z]/) < 0 ||
                   p.search(/[A-Z]/) < 0) {
          this.shared.openMessageDialog('Data Entry Error', `
            <p>
              Password must contain at least one each of the following character types
            </p>
            <ul>
              <li>
                Numeric:&nbsp;&nbsp;&nbsp;&nbsp;0-9
              </li>
              <li>
                Lower Case:&nbsp;&nbsp;&nbsp;&nbsp;a-z
              </li>
              <li>
                Upper Case:&nbsp;&nbsp;&nbsp;&nbsp;A-Z
              </li>
            </ul>`);
          return false;
        } else if (p !== pp) {
          this.shared.openMessageDialog('Data Entry Error', 'Password and Confirm Password must match exactly');
          return false;
        }
        return true;
      }
}
