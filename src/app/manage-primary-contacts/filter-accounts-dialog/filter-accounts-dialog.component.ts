import {
	Component,
	EventEmitter,
	Inject,
	Injectable,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core';
import {
	MatSort,
	MatPaginator,
	MatTableDataSource,
	MAT_DIALOG_DATA,
	MatDialogRef,
} from '@angular/material';
import { Account } from 'src/app/types';

@Injectable()
export class FilterAccountService {
	@Output() filter: EventEmitter<any> = new EventEmitter();
}

@Component({
	selector: 'app-filter-accounts-dialog',
	templateUrl: './filter-accounts-dialog.component.html',
	styleUrls: ['./filter-accounts-dialog.component.css'],
})
export class FilterAccountsDialogComponent implements OnInit {
	@ViewChild('allAccountsSort') allAccountsSort: MatSort;
	@ViewChild('allAccountsPaginator') allAccountsPaginator: MatPaginator;
	displayedColumns: string[] = ['custId', 'fleetId', 'name', 'select'];
	accounts = [];
	accountsDataSource = new MatTableDataSource<Account>(this.accounts);
	allAccounts = new Account('All', 'All', 'All');
	sorting = {
		column: 'custId',
		direction: 'asc',
	};

	constructor(
		private filterAccountService: FilterAccountService,
		public dialogRef: MatDialogRef<any>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {
		this.accounts = this.data.accounts;
		this.accountsDataSource.data = this.accounts;
		this.accountsDataSource.paginator = this.allAccountsPaginator;
	}

	closeDialog(): void {
		this.dialogRef.close();
	}

	applyFilter(filterValue: string) {
		this.accountsDataSource.filter = filterValue.trim().toLowerCase();
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
			this.accountsDataSource.data = this.accounts.sort((a, b) => {
				if (a[column] < b[column]) {
					return -1;
				}
				if (a[column] > b[column]) {
					return 1;
				}
				return 0;
			});
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

	selectAccount(account: Account) {
		this.filterAccountService.filter.emit(account);
		this.closeDialog();
	}
}
