import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import {
	MatProgressSpinnerModule,
	MatButtonModule,
	MatInputModule,
	MatIconModule,
	MatSelectModule,
} from '@angular/material';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SharedService } from './shared/shared.service';
import { MessageDialogComponent } from './shared/message-dialog.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';
import { ManagePrimaryContactsComponent } from './manage-primary-contacts/manage-primary-contacts.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CacheInterceptor } from './cache-interceptor';
// import { ManageAccountsComponent, SaveLogoService, AccountProfileDialogComponent, AccountPhotoDialogComponent } from './manage-accounts/manage-accounts.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
	PrimaryContactDialogComponent,
	PrimaryContactService,
} from './manage-primary-contacts/primary-contact-dialog/primary-contact-dialog.component';
import {
	FilterAccountsDialogComponent,
	FilterAccountService,
} from './manage-primary-contacts/filter-accounts-dialog/filter-accounts-dialog.component';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		LoginComponent,
		ManagePrimaryContactsComponent,
		PrimaryContactDialogComponent,
		MessageDialogComponent,
		ConfirmDialogComponent,
		ResetPasswordComponent,
		UserProfileComponent,
		FilterAccountsDialogComponent,
		// ManageAccountsComponent,
		// AccountProfileDialogComponent,
		// AccountPhotoDialogComponent
	],
	imports: [
		AppRoutingModule,
		BrowserModule,
		HttpClientModule,
		FormsModule,
		MatFormFieldModule,
		MatTableModule,
		MatProgressSpinnerModule,
		BrowserAnimationsModule,
		MatPaginatorModule,
		MatButtonModule,
		MatSortModule,
		MatInputModule,
		MatToolbarModule,
		MatCardModule,
		MatDialogModule,
		MatTabsModule,
		MatChipsModule,
		MatListModule,
		MatMenuModule,
		MatIconModule,
		ImageCropperModule,
		MatSelectModule,
	],
	entryComponents: [
		PrimaryContactDialogComponent,
		MessageDialogComponent,
		ConfirmDialogComponent,
		FilterAccountsDialogComponent,
		// AccountProfileDialogComponent,
		// AccountPhotoDialogComponent
	],
	providers: [
		SharedService,
		PrimaryContactService,
		FilterAccountService,
		// SaveLogoService,
		{ provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
