// import { Component, OnInit, ViewChild, Inject, Injectable, Output, EventEmitter, OnDestroy } from '@angular/core';
// import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
// import { SharedService } from '../shared/shared.service';
// import { ApiResponse, Account } from '../types';
// import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
// import { Subscription } from 'rxjs';
// import { UserData } from '../shared/user.model';
// import { AccountData, AccountProfileData } from '../shared/account.model';
// import { Router } from '@angular/router';


// @Injectable()
// export class SaveLogoService {
//   @Output() save: EventEmitter<any> = new EventEmitter();

// }

// @Component({
//     selector: 'app-manage-accounts',
//     templateUrl: './manage-accounts.component.html',
//     styleUrls: ['./manage-accounts.component.css']
// })

// export class ManageAccountsComponent implements OnInit {
//     appUser: UserData;
//     showSpinner = false;
//     accounts: Account[] = [];
//     accountsFinished = false;
//     accountsDataSource = new MatTableDataSource<Account>();
//     @ViewChild('accountsSort') accountsSort: MatSort;
//     @ViewChild('accountsPaginator') accountsPaginator: MatPaginator;
//     displayedColumns: string[] = ['custId', 'fleetId', 'name', 'select'];
//     sorting = {
//       column: 'custId',
//       direction: 'asc'
//     };
//     constructor(private shared: SharedService, private http: HttpClient, public dialog: MatDialog, private router: Router) {}

//     ngOnInit() {
//         this.appUser = this.shared.appUser;
//         this.getAccounts();
//     }

//     getAccounts() {
//         this.showSpinner = true;
//         const params =
//           new HttpParams()
//             .append('thisAction', this.shared.ACTION_LIST_ACCOUNTS)
//             .append('zone', this.shared.appUser.zoneId)
//             .append('token', this.shared.appUser.identity.token)
//             .append('userId', this.shared.appUser.userId)
//             .append('application', this.shared.appInit.application.toString());
//         this.http.get(
//           this.shared.appInit.apiPath + 'accountsetup',
//           {params, withCredentials: false }).subscribe((response: ApiResponse) => {
//             this.showSpinner = false;
//             if (response.errorMessage) {
//               this.shared.openMessageDialog('Data Access Error', response.errorMessage);
//               return;
//             }
//             const data = JSON.parse(response.body);
//             if (data.status === 'OK') {
//               data.accounts.forEach((account) => {
//                 this.accounts.push(new Account(account.custId, account.fleetId, account.name));
//               });
//               this.accounts.sort( (a, b) => {
//                 if (a.custId < b.custId) {
//                   return -1;
//                 }
//                 if (a.custId > b.custId) {
//                   return 1;
//                 }
//                 return 0;
//               });
//               this.accountsFinished = true;
//               this.accountsDataSource.data = this.accounts;
//               this.accountsDataSource.paginator = this.accountsPaginator;
//             } else if (data.status === 'AUTHENTICATION_ERROR') {
//               this.shared.authenticationErrorReturned();
//               this.router.navigate(['/']);
//             }
//           }, error => {
//             this.showSpinner = false;
//             this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
//           });
//       }

//       sortData(column: string) {
//         if (this.sorting.column === column) {
//           if (this.sorting.direction === 'asc') {
//             this.sorting.direction = 'desc';
//           } else {
//             this.sorting.direction = 'asc';
//           }
//         } else {
//           this.sorting.column = column;
//           this.sorting.direction = 'asc';
//         }

//         if (this.sorting.direction === 'asc') {
//             this.accountsDataSource.data = this.accounts.sort((a, b) => {
//               if (a[column] < b[column]) {
//                 return -1;
//               }
//               if (a[column] > b[column]) {
//                 return 1;
//               }
//               return 0;
//             });
//         } else {
//             this.accountsDataSource.data = this.accounts.sort((a, b) => {
//               if (a[column] < b[column]) {
//                 return 1;
//               }
//               if (a[column] > b[column]) {
//                 return -1;
//               }
//               return 0;
//             });
//         }
//       }

//     applyFilterAccounts(filterValue: string) {
//         this.accountsDataSource.filter = filterValue.trim().toLowerCase();
//     }

//     openAccountProfile(account: AccountData) {
//       const dialogRef = this.dialog.open(AccountProfileDialogComponent, {
//         width: '40%',
//         height: '70%',
//         data: {
//           account,
//           userId: this.appUser.userId,
//           appUser: this.appUser,
//           zone: this.appUser.zoneId
//         },
//         panelClass: 'mat-elevation-z5'
//       })
//     }
// }


// @Component({
//   selector: 'app-account-profile-dialog',
//   templateUrl: './account-profile-dialog.html',
//   styleUrls: ['./account-profile-dialog.css']
// })

// export class AccountProfileDialogComponent implements OnInit, OnDestroy {
//   account: AccountData;
//   userId: string;
//   appUser: UserData;
//   zone: string;
//   showSpinner = false;
//   accountLogo: string;
//   attn: string;
//   phone: string;
//   address1: string;
//   address2: string;
//   fax: string;
//   billAttn: string;
//   billPhone: string;
//   billAddress1: string;
//   billAddress2: string;
//   billFax: string;
//   logoSubscription: Subscription;
//   showProfile = false;
//   showEditProfile = false;
//   profile: AccountProfileData;
//   showDeletePhoto = false;
//   confirmSubscription: Subscription;


//   constructor(
//     public shared: SharedService,
//     public dialogRef: MatDialogRef<any>,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     public dialog: MatDialog,
//     private http: HttpClient,
//     private saveLogoService: SaveLogoService,
//     private router: Router
//   ) {
//       this.logoSubscription = this.saveLogoService.save.subscribe({
//         next: () => {
//           this.getAccountPhoto();
//         }
//       });
//     }

//   ngOnInit() {
//     this.account = this.data.account;
//     this.userId = this.data.userId;
//     this.appUser = this.data.appUser;
//     this.zone = this.data.zone;
//     this.getAccountPhoto();
//   }

//   ngOnDestroy() {
//     if (this.confirmSubscription) {
//       this.confirmSubscription.unsubscribe();
//     }

//     if (this.logoSubscription) {
//       this.logoSubscription.unsubscribe();
//     }
//   }

//   closeDialog() {
//     this.dialogRef.close();
//   }

//   selectAccountPhoto() {
//     const input = document.querySelector('#accountPhotoInput');
//     (input as HTMLTextAreaElement).click();
//   }

//   onFileSelected(event: any) {
//     const dialogRef = this.dialog.open(AccountPhotoDialogComponent, {
//       width: '500px',
//       data: {
//         event,
//         userId: this.userId,
//         appUser: this.appUser,
//         zone: this.zone,
//         account: this.account
//       },
//       panelClass: 'mat-elevation-z5'
//     });
//   }

//   getAccountPhoto() {
//     const params = new HttpParams()
//       .append('userId', this.userId)
//       .append('zone', this.zone)
//       .append('updateAction', '2')
//       .append('token', this.appUser.identity.token)
//       .append('accountNbr', this.account.custId)
//       .append('fleetId', this.account.fleetId)
//       .append('application', this.shared.appInit.application.toString());

//     this.showSpinner = true;
//     this.http.get(this.shared.appInit.apiPath + 'accountprofile',
//        {params, withCredentials: false}).subscribe((response: ApiResponse) => {
//         this.showSpinner = false;
//         if (response.errorMessage) {
//           this.shared.openMessageDialog('Data Access Error', response.errorMessage);
//           return;
//         }

//         const data = JSON.parse(response.body);
//         if (data.status === 'OK') {
//           // adding the time stamp bypasses the cache to make sure
//           // the image displayed is the new image
//           if (data.accountLogo !== 'https://account-logos.s3.us-east-2.amazonaws.com/default.png') {
//             this.showDeletePhoto = true;
//           }
//           this.accountLogo = data.accountLogo + '?t=' + new Date().getTime();
//           if (!this.profile) {
//             this.getAccountInfo();
//           }
//         } else if (data.status === 'AUTHENTICATION_ERROR') {
//           this.shared.authenticationErrorReturned();
//           this.router.navigate(['/']);
//           this.closeDialog();
//         }
//       }, error => {
//         this.showSpinner = false;
//         this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
//       });

//   }

//   deleteAccountPhoto() {
//     const dialog = this.shared.openConfirmDialog(
//       'Delete Account Logo',
//       `Delete the account logo for ${this.account.name}?`);
//     this.confirmSubscription = dialog.componentInstance.Choice.subscribe((confirm: boolean) => {
//       if (confirm) {
//         const params = new HttpParams()
//         .append('userId', this.userId)
//         .append('zone', this.zone)
//         .append('updateAction', '6')
//         .append('token', this.appUser.identity.token)
//         .append('accountNbr', this.account.custId)
//         .append('fleetId', this.account.fleetId)
//         .append('application', this.shared.appInit.application.toString());

//         this.showSpinner = true;
//         this.http.get(this.shared.appInit.apiPath + 'accountprofile',
//            {params, withCredentials: false}).subscribe((response: ApiResponse) => {
//             this.showSpinner = false;
//             if (response.errorMessage) {
//               this.shared.openMessageDialog('Data Access Error', response.errorMessage);
//               return;
//             }

//             const data = JSON.parse(response.body);
//             if (data.status === 'OK') {
//               // adding the time stamp bypasses the cache to make sure
//               // the image displayed is the new image
//               this.showDeletePhoto = false;
//               this.accountLogo = data.accountLogo + '?t=' + new Date().getTime();
//             } else if (data.status === 'AUTHENTICATION_ERROR') {
//               this.shared.authenticationErrorReturned();
//               this.router.navigate(['/']);
//               this.closeDialog();
//             }
//           }, error => {
//               this.showSpinner = false;
//               this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
//           });
//       }
//     });
//   }

//   getAccountInfo() {
//     const params = new HttpParams()
//       .append('userId', this.userId)
//       .append('zone', this.zone)
//       .append('updateAction', '4')
//       .append('token', this.appUser.identity.token)
//       .append('accountNbr', this.account.custId)
//       .append('fleetId', this.account.fleetId)
//       .append('application', this.shared.appInit.application.toString());

//     this.showSpinner = true;
//     // tslint:disable-next-line: max-line-length
//     this.http.get(this.shared.appInit.apiPath + 'accountprofile', {params, withCredentials: false}).subscribe((response: ApiResponse) => {
//         this.showSpinner = false;
//         if (response.errorMessage) {
//           this.shared.openMessageDialog('Data Access Error', response.errorMessage);
//           return;
//         }

//         const data = JSON.parse(response.body);
//         if (data.status === 'OK') {
//           this.profile = data.account;
//           this.formatAccountInfo();
//         } else if (data.status === 'AUTHENTICATION_ERROR') {
//           this.shared.authenticationErrorReturned();
//           this.router.navigate(['/']);
//           this.closeDialog();
//         }
//       }, error => {
//         this.showSpinner = false;
//         this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
//       });
//   }

//   updateAccountInfo() {
//     const params = new HttpParams()
//       .append('userId', this.userId)
//       .append('zone', this.zone)
//       .append('updateAction', '5')
//       .append('token', this.appUser.identity.token)
//       .append('accountNbr', this.account.custId)
//       .append('fleetId', this.account.fleetId)
//       .append('attn', this.profile.attn)
//       .append('phone', this.profile.phone)
//       .append('addr1', this.profile.addr1)
//       .append('addr2', this.profile.addr2)
//       .append('city', this.profile.city)
//       .append('state', this.profile.state)
//       .append('zip', this.profile.zip)
//       .append('fax', this.profile.fax)
//       .append('billAttn', this.profile.billAttn)
//       .append('billPhone', this.profile.billPhone)
//       .append('billAddr1', this.profile.billAddr1)
//       .append('billAddr2', this.profile.billAddr2)
//       .append('billState', this.profile.billState)
//       .append('billCity', this.profile.billCity)
//       .append('billZip', this.profile.billZip)
//       .append('billFax', this.profile.billFax)
//       .append('application', this.shared.appInit.application.toString());

//     this.showSpinner = true;
//     this.http.get(this.shared.appInit.apiPath + 'accountprofile',
//     {params, withCredentials: false}).subscribe((response: ApiResponse) => {
//         this.showSpinner = false;
//         if (response.errorMessage) {
//           this.shared.openMessageDialog('Data Access Error', response.errorMessage);
//           return;
//         }

//         const data = JSON.parse(response.body);
//         if (data.status === 'OK') {
//           this.profile = data.account;
//           this.formatAccountInfo();
//         } else if (data.status === 'AUTHENTICATION_ERROR') {
//           this.shared.authenticationErrorReturned();
//           this.router.navigate(['/']);
//           this.closeDialog();
//         }
//       }, error => {
//         this.showSpinner = false;
//         this.shared.openMessageDialog('Update Error', error.message);
//       });
//   }

//   formatAccountInfo() {
//     this.attn = this.profile.attn !== ' ' ? this.profile.attn : ' ';
//     this.phone = this.profile.phone !== ' ' ? this.shared.formatPhone(this.profile.phone) : ' ';
//     this.address1 = this.profile.addr1 !== ' ' ? this.profile.addr1 : ' ';
//     this.address1 += this.profile.addr2 !== ' ' ? (', ' + this.profile.addr2) : '';
//     this.address2 = this.profile.city + ', ' + this.profile.state + ' ' + this.profile.zip;
//     this.fax = this.profile.fax !== ' ' ? this.shared.formatPhone(this.profile.fax) : ' ';

//     this.billAttn = this.profile.billAttn !== ' ' ? this.profile.billAttn : ' ';
//     this.billPhone = this.profile.billPhone !== ' ' ? this.shared.formatPhone(this.profile.billPhone) : ' ';
//     this.billAddress1 = this.profile.billAddr1 !== ' ' ? this.profile.billAddr1 : ' ';
//     this.billAddress1 += this.profile.billAddr2 !== ' ' ? (', ' + this.profile.billAddr2) : '';
//     this.billAddress2 = this.profile.billCity + ', ' + this.profile.billState + ' ' + this.profile.billZip;
//     this.billFax = this.profile.billFax !== ' ' ? this.shared.formatPhone(this.profile.billFax) : ' ';

//     this.showProfile = true;
//     this.showEditProfile = false;
//     (document.querySelector('.mat-dialog-container') as any).fakeScroll();
//   }
// }


// @Component({
//   selector: 'app-account-photo-dialog',
//   templateUrl: './account-photo-dialog.html',
//   styleUrls: ['./account-profile-dialog.css']
// })

// export class AccountPhotoDialogComponent implements OnInit, OnDestroy {
//   event: any;
//   croppedImage: any = '';
//   imageChangedEvent: any = '';
//   showSpinner = false;
//   userId: string;
//   zone: string;
//   appUser: UserData;
//   account: AccountData;

//   constructor(
//     public dialogRef: MatDialogRef<any>,
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private shared: SharedService,
//     private http: HttpClient,
//     private saveLogoService: SaveLogoService,
//     private router: Router
//   ) {}

//   ngOnInit() {
//     this.imageChangedEvent = this.data.event;
//     this.userId = this.data.userId;
//     this.zone = this.data.zone;
//     this.appUser = this.data.appUser;
//     this.account = this.data.account;
//   }

//   ngOnDestroy() {

//   }

//   fileChangeEvent(event: any): void {
//     this.imageChangedEvent = event;
//   }

//   imageCropped(event: any) {
//     this.croppedImage = event.file;
//   }

//   imageLoaded() {
//     // show cropper
//   }

//   loadImageFailed() {
//     this.shared.openMessageDialog('Loading Image Failed', 'Please try again.');
//     this.dialogRef.close();
//   }

//   closeDialog(): void {
//     this.showSpinner = false;
//     this.dialogRef.close();
//     this.imageChangedEvent = '';
//     this.croppedImage = '';
//   }

//   selectAccountPhoto() {
//     const input = document.querySelector('#accountPhotoInputDialog');
//     (input as HTMLTextAreaElement).click();
//   }

//   uploadPhoto() {
//     const self = this;
//     const params = new HttpParams()
//       .append('userId', this.userId)
//       .append('zone', this.zone)
//       .append('updateAction', '1')
//       .append('token', this.appUser.identity.token)
//       .append('accountNbr', this.account.custId)
//       .append('fleetId', this.account.fleetId)
//       .append('accountName', this.account.name)
//       .append('application', this.shared.appInit.application.toString());
//     this.showSpinner = true;
//     this.http.get(this.shared.appInit.apiPath + 'accountprofile',
//      {params, withCredentials: false}).subscribe((response: ApiResponse) => {
//       if (response.errorMessage) {
//         this.shared.openMessageDialog('Data Access Error', response.errorMessage);
//         return;
//       }

//       const data = JSON.parse(response.body);
//       if (data.status === 'OK') {
//         const url = data.url;
//         self.http.put(url, self.croppedImage, {headers: new HttpHeaders({
//           'Content-Type': 'image/png'
//         }), observe: 'response'}).subscribe((res: any) => {
//           if (res.status === 200) {
//             this.updateAccountLogo();
//           }
//         },
//         error => {
//           this.showSpinner = false;
//           this.shared.openMessageDialog('Update Error', error.message);
//         });
//       } else if (data.status === 'AUTHENTICATION_ERROR') {
//         this.shared.authenticationErrorReturned();
//         this.router.navigate(['/']);
//         this.closeDialog();
//       }
//     }, error => {
//       this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
//     });
//   }

//   updateAccountLogo() {
//     const params = new HttpParams()
//       .append('userId', this.userId)
//       .append('zone', this.zone)
//       .append('updateAction', '3')
//       .append('token', this.appUser.identity.token)
//       .append('accountNbr', this.account.custId)
//       .append('fleetId', this.account.fleetId)
//       .append('accountName', this.account.name)
//       .append('application', this.shared.appInit.application.toString());

//     this.http.get(this.shared.appInit.apiPath + 'accountprofile',
//     {params, withCredentials: false}).subscribe((response: ApiResponse) => {
//       this.showSpinner = false;
//       if (response.errorMessage) {
//         this.shared.openMessageDialog('Data Access Error', response.errorMessage);
//         return;
//       }

//       const data = JSON.parse(response.body);
//       if (data.status === 'OK') {
//         this.saveLogoService.save.emit();
//         this.closeDialog();
//       } else if (data.status === 'AUTHENTICATION_ERROR') {
//         this.shared.authenticationErrorReturned();
//         this.router.navigate(['/']);
//         this.closeDialog();
//       }
//     }, error => {
//       this.showSpinner = false;
//       this.shared.openMessageDialog('Data Access Error', 'Something went wrong. Please try again.');
//     });
//   }
// }
