import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MessageDialogComponent } from '../shared/message-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { AppInitData } from './app-init.model';
import { UserData } from './user.model';


@Injectable()
export class SharedService {
    constructor (private dialog: MatDialog) {}
    isLoggedIn = false;
    appUser: UserData;
    public resetPasswordSet = new Subject();
    public authenticationError = new Subject();
    public secret = '';
    public appInit: AppInitData;



    ACTION_CREATE = 'C';
    ACTION_READ = 'R';
    ACTION_UPDATE = 'U';
    ACTION_DELETE = 'D';
    ACTION_LIST_ADMINS = 'LADM';
    ACTION_LIST_ACCOUNTS = 'LACCT';

    resetPasswordCompleted() {
      this.resetPasswordSet.next();
    }

    authenticationErrorReturned() {
      this.authenticationError.next();
    }


    openMessageDialog(title: string, message: string): MatDialogRef<MessageDialogComponent, any> {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
          width: '400px',
          height: '250px',
          data: { title: title, message: message }
        });
        return dialogRef;
      }

      openConfirmDialog(title: string, message: string): MatDialogRef<ConfirmDialogComponent, any> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          height: '250px',
          data: { title: title, message: message }
        });
        return dialogRef;
      }

    formatPhone(input: string): string {
      const output = this.unformatPhone(input).split('');
      if (output.length === 10) {
          output.splice(3, 0, '.');
          output.splice(7, 0, '.');
      }
      return output.join('');
    }

    unformatPhone(input: string): string {
      const chars = input.split('');
      let output = '';
      chars.forEach((char: string) => {
          if (output.length < 10) {
              if (!isNaN(parseInt(char, 10))) {
                  output += char;
              }
          }
      });
      return output;
  }
}
