import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	EventEmitter,
	Output,
	Inject,
	AfterViewInit,
	OnDestroy,
	Injectable,
	ViewChildren,
	QueryList,
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SharedService } from '../shared/shared.service';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { Account, ApiResponse } from '../types';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserData } from '../shared/user.model';
import { Router } from '@angular/router';
import {
	PrimaryContactDialogComponent,
	PrimaryContactService,
} from './primary-contact-dialog/primary-contact-dialog.component';
import {
	FilterAccountsDialogComponent,
	FilterAccountService,
} from './filter-accounts-dialog/filter-accounts-dialog.component';

export class Administrator {
	firstName = '';
	lastName = '';
	userId = '';
	webUserId = 0;
	accounts: Account[] = [];

	constructor(
		firstName: string,
		lastName: string,
		userId: string,
		webUserId: number,
		accounts: any[]
	) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.userId = userId;
		this.webUserId = webUserId;
		accounts.forEach((account) => {
			this.accounts.push(
				new Account(account.custId, account.fleetId, account.name)
			);
		});
	}
}

@Component({
	selector: 'app-manage-primary-contacts',
	templateUrl: './manage-primary-contacts.component.html',
	styleUrls: ['./manage-primary-contacts.component.css'],
})
export class ManagePrimaryContactsComponent implements OnInit, OnDestroy {
	// tslint:disable-next-line:no-output-on-prefix
	@Output() onLogout = new EventEmitter();
	primaryContactsFinished = false;
	accountsFinished = false;
	showSpinner = 0;
	accounts: Account[] = [];
	dataSource = new MatTableDataSource<Account>();
	dataSourceAdmins = new MatTableDataSource<Administrator>();
	displayedColumnsAdmins: string[] = [
		'lastName',
		'firstName',
		'userId',
		'select',
	];
	admins: Administrator[] = [];
	allAdmins: Administrator[] = [];
	//   adminAccounts: Account[] = [];
	@ViewChild(MatSort) sort: MatSort;
	crudContext = '';
	primaryContactSubscription: Subscription;
	filterAccountSubscription: Subscription;
	sorting = {
		column: 'lastName',
		direction: 'asc',
	};

	selectedAccount = new Account('All', 'All', 'All');

	@ViewChild('filtLastName') filtLastName: ElementRef;
	@ViewChild('filtFirstName') filtFirstName: ElementRef;

	constructor(
		private primaryContactService: PrimaryContactService,
		private filterAccountService: FilterAccountService,
		private shared: SharedService,
		private http: HttpClient,
		public dialog: MatDialog,
		private router: Router
	) {
		this.primaryContactSubscription = this.primaryContactService.save.subscribe(
			{
				next: () => {
					this.getPrimaryContacts();
				},
			}
		);

		this.filterAccountSubscription = this.filterAccountService.filter.subscribe(
			{
				next: (account: Account) => {
					this.selectedAccount = account;
					this.filterAdmins();
				},
			}
		);
	}

	ngOnInit() {
		this.dataSourceAdmins.sort = this.sort;
		this.getPrimaryContacts();
		this.getAccounts();
	}

	ngOnDestroy() {
		if (this.primaryContactSubscription) {
			this.primaryContactSubscription.unsubscribe();
		}

		if (this.filterAccountSubscription) {
			this.filterAccountSubscription.unsubscribe();
		}
	}

	sortAdminsByName(column: string) {
		if (this.sorting.column === column) {
			if (this.sorting.direction === 'asc') {
				this.sorting.direction = 'desc';
			} else {
				this.sorting.direction = 'asc';
			}
		} else {
			this.sorting.column = column;
			this.sorting.direction = 'asc';
		}

		this.filterAdmins();
	}

	filterAdmins() {
		this.admins = [];
		this.allAdmins.forEach((admin) => {
			const matchesLastName = this.checkLastName(admin.lastName);
			const matchesFirstName = this.checkFirstName(admin.firstName);

			const userHasAccount = this.checkUserHasAccount(admin);

			if (matchesLastName && matchesFirstName && userHasAccount) {
				this.admins.push(admin);
			}
		});
		this.sortAdmins();
	}

	sortAdmins() {
		if (this.sorting.direction === 'asc') {
			this.admins.sort((a, b) =>
				a[this.sorting.column] < b[this.sorting.column]
					? -1
					: a[this.sorting.column] > b[this.sorting.column]
					? 1
					: 0
			);
		} else {
			this.admins.sort((a, b) =>
				a[this.sorting.column] > b[this.sorting.column]
					? -1
					: a[this.sorting.column] < b[this.sorting.column]
					? 1
					: 0
			);
		}
	}

	checkFirstName(firstName: string) {
		let searchText = this.filtFirstName.nativeElement.value;
		if (!searchText) {
			return true;
		}
		searchText = searchText.toLowerCase().trim();
		if (firstName.toString().toLowerCase().startsWith(searchText)) {
			return true;
		} else {
			return false;
		}
	}
	checkLastName(lastName: string) {
		let searchText = this.filtLastName.nativeElement.value;
		if (!searchText) {
			return true;
		}
		searchText = searchText.toLowerCase().trim();
		if (lastName.toString().toLowerCase().startsWith(searchText)) {
			return true;
		} else {
			return false;
		}
	}

	checkUserHasAccount(admin: Administrator) {
		if (this.selectedAccount.custId === 'All') {
			return true;
		}
		const custId = this.selectedAccount.custId;
		const fleetId = this.selectedAccount.fleetId;
		let accountFound = false;
		for (let i = 0; i < admin.accounts.length; i++) {
			if (
				admin.accounts[i].custId === custId &&
				admin.accounts[i].fleetId === fleetId
			) {
				accountFound = true;
				break;
			}
		}
		if (accountFound) {
			return true;
		}
		return false;
	}

	openEditPrimaryContactDialog(webUserId) {
		let i;
		let userId;
		let firstName;
		let lastName;
		const addedAccounts = [];

		for (i = 0; i < this.dataSourceAdmins.data.length; i++) {
			if (this.dataSourceAdmins.data[i].webUserId === webUserId) {
				userId = this.dataSourceAdmins.data[i].userId;
				firstName = this.dataSourceAdmins.data[i].firstName;
				lastName = this.dataSourceAdmins.data[i].lastName;
				this.dataSourceAdmins.data[i].accounts.forEach((account) => {
					addedAccounts.push(
						new Account(
							account.custId,
							account.fleetId,
							account.name
						)
					);
				});
				break;
			}
		}
		const dialogRef = this.dialog.open(PrimaryContactDialogComponent, {
			width: '900px',
			height: '920px',
			data: {
				userId,
				webUserId,
				firstName,
				lastName,
				addedAccounts,
				accounts: this.accounts,
				crudContext: this.shared.ACTION_UPDATE,
			},
			panelClass: ['mat-elevation-z5', 'primary-contact-dialog'],
		});
	}

	openAddPrimaryContactDialog() {
		const dialogRef = this.dialog.open(PrimaryContactDialogComponent, {
			width: '900px',
			height: '920px',
			data: {
				accounts: this.accounts,
				crudContext: this.shared.ACTION_CREATE,
			},
			panelClass: ['mat-elevation-z5', 'primary-contact-dialog'],
		});
	}

	openSelectAccountDialog() {
		const dialogRef = this.dialog.open(FilterAccountsDialogComponent, {
			width: '900px',
			height: '920px',
			data: {
				accounts: this.accounts,
			},
			panelClass: ['mat-elevation-z5', 'primary-contact-dialog'],
		});
	}

	getAccounts() {
		this.showSpinner += 1;
		const params = new HttpParams()
			.append('thisAction', this.shared.ACTION_LIST_ACCOUNTS)
			.append('zone', this.shared.appUser.zoneId)
			.append('token', this.shared.appUser.identity.token)
			.append('userId', this.shared.appUser.userId)
			.append('application', this.shared.appInit.application.toString());
		this.http
			.get(this.shared.appInit.apiPath + 'accountsetup', {
				params,
				withCredentials: false,
			})
			.subscribe(
				(response: ApiResponse) => {
					this.showSpinner -= 1;
					if (response.errorMessage) {
						this.shared.openMessageDialog(
							'Data Access Error',
							response.errorMessage
						);
						return;
					}
					const data = JSON.parse(response.body);
					if (data.status === 'OK') {
						data.accounts.forEach((account) => {
							this.accounts.push(
								new Account(
									account.custId,
									account.fleetId,
									account.name
								)
							);
						});
						this.accounts.sort((a, b) => {
							if (a.custId < b.custId) {
								return -1;
							}
							if (a.custId > b.custId) {
								return 1;
							}
							return 0;
						});
						this.dataSource.data = this.accounts;
						this.accountsFinished = true;
					} else if (data.status === 'AUTHENTICATION_ERROR') {
						this.shared.authenticationErrorReturned();
						this.router.navigate(['/']);
					}
				},
				(error) => {
					this.showSpinner -= 1;
					this.shared.openMessageDialog(
						'Data Access Error',
						'Something went wrong. Please try again.'
					);
				}
			);
	}

	getPrimaryContacts() {
		this.showSpinner += 1;
		const params = new HttpParams()
			.append('thisAction', this.shared.ACTION_LIST_ADMINS)
			.append('zone', this.shared.appUser.zoneId)
			.append('token', this.shared.appUser.identity.token)
			.append('application', this.shared.appInit.application.toString());
		this.http
			.get(this.shared.appInit.apiPath + 'accountsetup', {
				params,
				withCredentials: false,
			})
			.subscribe(
				(response: ApiResponse) => {
					this.showSpinner -= 1;
					if (response.errorMessage) {
						this.shared.openMessageDialog(
							'Data Access Error',
							response.errorMessage
						);
						return;
					}
					const data = JSON.parse(response.body);
					if (data.status === 'OK') {
						this.allAdmins = [];
						this.admins = [];
						data.admins.forEach((admin) => {
							this.allAdmins.push(
								new Administrator(
									admin.firstName,
									admin.lastName,
									admin.userId,
									admin.webUserId,
									admin.accounts
								)
							);
						});
						this.filterAdmins();
						this.dataSourceAdmins.data = this.admins;
						this.primaryContactsFinished = true;
						(document.querySelector(
							'.table-wrapper'
						) as any).fakeScroll();
					} else if (data.status === 'AUTHENTICATION_ERROR') {
						this.shared.authenticationErrorReturned();
						this.router.navigate(['/']);
					}
				},
				(error) => {
					this.showSpinner -= 1;
					this.shared.openMessageDialog(
						'Data Access Error',
						'Something went wrong. Please try again.'
					);
				}
			);
	}
}
