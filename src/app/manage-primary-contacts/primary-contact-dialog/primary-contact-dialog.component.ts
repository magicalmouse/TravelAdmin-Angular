import { HttpClient, HttpParams } from '@angular/common/http';
import {
	Component,
	OnInit,
	OnDestroy,
	ViewChild,
	Inject,
	EventEmitter,
	Injectable,
	Output,
} from '@angular/core';
import {
	MatSort,
	MatPaginator,
	MatTableDataSource,
	MatDialogRef,
	MAT_DIALOG_DATA,
} from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiResponse } from 'src/app/shared/api.model';
import { SharedService } from 'src/app/shared/shared.service';
import { UserData } from 'src/app/shared/user.model';

@Injectable()
export class PrimaryContactService {
	@Output() save: EventEmitter<any> = new EventEmitter();
}

@Component({
	selector: 'app-primary-contact-dialog',
	templateUrl: './primary-contact-dialog.component.html',
	styleUrls: ['./primary-contact-dialog.component.css'],
})
export class PrimaryContactDialogComponent implements OnInit, OnDestroy {
	title: string;
	crudContext: string;
	showSpinner: boolean;
	disableEmail = true;
	firstName: string;
	lastName: string;
	userId: string;
	webUserId: number;
	@ViewChild('allAccountsSort') allAccountsSort: MatSort;
	@ViewChild('allAccountsPaginator') allAccountsPaginator: MatPaginator;
	@ViewChild('addedAccountsPaginator') addedAccountsPaginator: MatPaginator;
	@ViewChild('addedAccountsSort') addedAccountsSort: MatSort;
	displayedColumns: string[] = ['custId', 'fleetId', 'name', 'select'];
	confirmSubscription: Subscription;
	appUser: UserData;
	accounts = [];
	accountsDataSource = new MatTableDataSource<Account>(this.accounts);
	addedAccounts = [];
	addedAccountsDataSource = new MatTableDataSource<Account>(
		this.addedAccounts
	);
	showAddedAccounts = false;
	sorting = {
		column: 'custId',
		direction: 'asc',
	};

	constructor(
		private primaryContactService: PrimaryContactService,
		public dialogRef: MatDialogRef<any>,
		public shared: SharedService,
		private http: HttpClient,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router
	) {}

	ngOnInit() {
		this.appUser = this.shared.appUser;
		this.crudContext = this.data.crudContext;
		if (this.crudContext === this.shared.ACTION_CREATE) {
			this.disableEmail = false;
			this.createInit();
		} else if (this.crudContext === this.shared.ACTION_UPDATE) {
			this.updateInit();
		} else {
			this.closeDialog();
		}
	}

	ngOnDestroy() {
		if (this.confirmSubscription) {
			this.confirmSubscription.unsubscribe();
		}
	}

	closeDialog(): void {
		this.dialogRef.close();
	}

	applyFilter(filterValue: string) {
		if (this.showAddedAccounts) {
			this.addedAccountsDataSource.filter = filterValue
				.trim()
				.toLowerCase();
		} else {
			this.accountsDataSource.filter = filterValue.trim().toLowerCase();
		}
	}

	sortData(column: string) {
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

		if (this.sorting.direction === 'asc') {
			if (this.showAddedAccounts) {
				this.addedAccountsDataSource.data = this.addedAccounts.sort(
					(a, b) => {
						if (a[column] < b[column]) {
							return -1;
						}
						if (a[column] > b[column]) {
							return 1;
						}
						return 0;
					}
				);
			} else {
				this.accountsDataSource.data = this.accounts.sort((a, b) => {
					if (a[column] < b[column]) {
						return -1;
					}
					if (a[column] > b[column]) {
						return 1;
					}
					return 0;
				});
			}
		} else {
			if (this.showAddedAccounts) {
				this.addedAccountsDataSource.data = this.addedAccounts.sort(
					(a, b) => {
						if (a[column] < b[column]) {
							return 1;
						}
						if (a[column] > b[column]) {
							return -1;
						}
						return 0;
					}
				);
			} else {
				this.accountsDataSource.data = this.accounts.sort((a, b) => {
					if (a[column] < b[column]) {
						return 1;
					}
					if (a[column] > b[column]) {
						return -1;
					}
					return 0;
				});
			}
		}
	}

	createInit() {
		this.title = 'Create New Primary Contact';
		this.accounts = [];
		this.data.accounts.forEach((account) => {
			account.selected = false;
			this.accounts.push(account);
		});
		this.accountsDataSource.data = this.accounts;
		this.accountsDataSource.paginator = this.allAccountsPaginator;
	}

	updateInit() {
		this.title = 'Update Primary Contact';
		this.firstName = this.data.firstName;
		this.lastName = this.data.lastName;
		this.userId = this.data.userId;
		this.webUserId = this.data.webUserId;
		this.accounts = [];
		this.data.accounts.forEach((account) => {
			account.selected = false;
			this.accounts.push(account);
		});
		this.data.addedAccounts.forEach((addedAccount) => {
			if (
				this.appUser.fleets.includes(addedAccount.fleetId) ||
				(this.appUser.fleets.length > 0 &&
					this.appUser.fleets[0] === '*')
			) {
				this.addedAccounts.push(addedAccount);
			}
		});
		this.accounts.forEach((account) => {
			this.addedAccounts.forEach((addedAccount) => {
				if (account.key === addedAccount.key) {
					account.selected = true;
				}
			});
		});
		this.accountsDataSource.data = this.accounts;
		this.accountsDataSource.paginator = this.allAccountsPaginator;
		this.addedAccountsDataSource.data = this.addedAccounts;
		this.addedAccountsDataSource.paginator = this.addedAccountsPaginator;
	}

	toggleAddedAccountsView() {
		this.showAddedAccounts = !this.showAddedAccounts;
		this.sorting = {
			column: '',
			direction: '',
		};
	}

	addAccount(key: string) {
		this.accounts.forEach((account) => {
			if (account.key === key) {
				account.selected = true;
				this.addedAccounts.push(account);
			}
		});
		this.accountsDataSource.data = this.accounts;
		this.accountsDataSource.paginator = this.allAccountsPaginator;
		this.addedAccountsDataSource.data = this.addedAccounts;
		this.addedAccountsDataSource.paginator = this.addedAccountsPaginator;
	}

	removeAccount(key: string) {
		this.accounts.forEach((account) => {
			if (account.key === key) {
				account.selected = false;
			}
		});
		let accountIndex = -1;
		for (let i = 0; i < this.addedAccounts.length; i++) {
			if (this.addedAccounts[i].key === key) {
				accountIndex = i;
			}
		}
		if (accountIndex >= 0) {
			this.addedAccounts.splice(accountIndex, 1);
		}

		this.accountsDataSource.data = this.accounts;
		this.accountsDataSource.paginator = this.allAccountsPaginator;
		this.addedAccountsDataSource.data = this.addedAccounts;
		this.addedAccountsDataSource.paginator = this.addedAccountsPaginator;
	}

	onCrud() {
		if (!this.userId || !this.firstName || !this.lastName) {
			this.shared.openMessageDialog(
				'Data Entry Error',
				'Please enter a valid Email Address, First Name, and Last Name'
			);
			return;
		}

		let i;

		/***** validate data entry *****/
		// email
		let email = null;
		if (this.crudContext === this.shared.ACTION_CREATE) {
			email = this.userId.trim();
			// tslint:disable-next-line:max-line-length
			const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (email.search(regex) < 0) {
				this.shared.openMessageDialog(
					'Data Entry Error',
					'Please enter a valid Email Address'
				);
				return;
			}
		}
		// name; only last name required
		const fn = this.firstName.trim();
		const ln = this.lastName.trim();
		if (ln.length < 2) {
			this.shared.openMessageDialog(
				'Data Entry Error',
				'Please enter a valid Last Name'
			);
			return;
		}
		// permissions
		const ar = true;
		const at = true;
		const ata = true;
		const apa = true;
		const amaa = true;
		// accounts
		let acct = '';
		if (!this.addedAccounts || this.addedAccounts.length === 0) {
			this.shared.openMessageDialog(
				'Data Entry Error',
				'At least one account must be selected'
			);
			return;
		}
		for (i = 0; i < this.addedAccounts.length; i++) {
			if (i > 0) {
				acct += '|';
			}
			acct += this.addedAccounts[i].key;
		}

		this.showSpinner = true;
		// update params
		let userId = '';
		let webUserId = '';
		if (this.crudContext === this.shared.ACTION_UPDATE) {
			userId = this.userId;
			webUserId = this.webUserId.toString();
		}

		const params = new HttpParams()
			.append('email', email)
			.append('userId', this.shared.appUser.userId)
			.append('webUserId', webUserId)
			.append('thisAction', this.crudContext)
			.append('fn', fn)
			.append('ln', ln)
			.append('ar', ar ? '1' : '0')
			.append('at', at ? '1' : '0')
			.append('ai', '0')
			.append('ata', ata ? '1' : '0')
			.append('apa', apa ? '1' : '0')
			.append('amaa', amaa ? '1' : '0')
			.append('rr', '0')
			.append('uid', userId)
			.append('acct', acct)
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
					this.showSpinner = false;
					if (response.errorMessage) {
						this.shared.openMessageDialog(
							'Data Access Error',
							response.errorMessage
						);
						return;
					}
					const data = JSON.parse(response.body);
					let header = '';
					let message = '';
					if (data.status === 'OK') {
						switch (this.crudContext) {
							case this.shared.ACTION_CREATE:
								header = 'Primary Contact Created';
								message = `Primary Contact '${this.userId.trim()}' created`;
								break;
							case this.shared.ACTION_UPDATE:
								header = 'Primary Contact Updated';
								message = `Primary Contact '${this.userId.trim()}' updated`;
								break;
						}
						this.shared.openMessageDialog(header, message);
						this.primaryContactService.save.emit();
						this.closeDialog();
					} else if (data.status === 'AUTHENTICATION_ERROR') {
						this.shared.authenticationErrorReturned();
						this.router.navigate(['/']);
						this.closeDialog();
					} else {
						switch (this.crudContext) {
							case this.shared.ACTION_CREATE:
								header = 'Primary Contact Creation Error';
								break;
							case this.shared.ACTION_UPDATE:
								header = 'Primary Contact Update Error';
								break;
						}
						this.shared.openMessageDialog(
							header,
							JSON.stringify(data.error)
						);
					}
				},
				(error) => {
					this.showSpinner = false;
					this.shared.openMessageDialog(
						'Data Access Error',
						'Something went wrong. Please try again.'
					);
				}
			);
	}

	onDelete() {
		const dialog = this.shared.openConfirmDialog(
			'Delete Primary Contact',
			`Delete Primary Contact ${this.userId}?`
		);
		this.confirmSubscription = dialog.componentInstance.Choice.subscribe(
			(confirm: boolean) => {
				if (confirm) {
					this.showSpinner = true;
					const params = new HttpParams()
						.append('uid', this.userId)
						.append('userId', this.shared.appUser.userId)
						.append('webUserId', this.webUserId.toString())
						.append('thisAction', this.shared.ACTION_DELETE)
						.append('zone', this.shared.appUser.zoneId)
						.append('token', this.shared.appUser.identity.token)
						.append(
							'application',
							this.shared.appInit.application.toString()
						);
					this.http
						.get(this.shared.appInit.apiPath + 'accountsetup', {
							params,
							withCredentials: false,
						})
						.subscribe(
							(response: ApiResponse) => {
								this.showSpinner = false;
								if (response.errorMessage) {
									this.shared.openMessageDialog(
										'Data Access Error',
										response.errorMessage
									);
									return;
								}
								const data = JSON.parse(response.body);
								let header = '';
								let message = '';
								if (data.status === 'OK') {
									header = 'Primary Contact Deleted';
									message =
										'Primary Contact ' +
										this.userId.trim() +
										' deleted';
									this.shared.openMessageDialog(
										header,
										message
									);
									this.primaryContactService.save.emit();
									this.closeDialog();
								} else if (
									data.status === 'AUTHENTICATION_ERROR'
								) {
									this.shared.authenticationErrorReturned();
									this.router.navigate(['/']);
									this.closeDialog();
								} else {
									header = 'Primary Contact Deletion Error';
									this.shared.openMessageDialog(
										header,
										JSON.stringify(data.error)
									);
								}
							},
							(error) => {
								this.showSpinner = false;
								this.shared.openMessageDialog(
									'Data Access Error',
									'Something went wrong. Please try again.'
								);
							}
						);
				}
			}
		);
	}
}
