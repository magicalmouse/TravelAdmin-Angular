import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {ResetPasswordComponent} from './reset-password/reset-password.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HomeComponent } from './home/home.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent},
    { path: 'reset-password', component: ResetPasswordComponent},
    { path: 'user-profile', component: UserProfileComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(appRoutes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule]
})
export class AppRoutingModule {}
