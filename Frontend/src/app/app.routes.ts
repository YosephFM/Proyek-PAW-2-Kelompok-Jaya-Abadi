import { Routes } from '@angular/router';
<<<<<<< Updated upstream
import { ParticipantsListComponent } from './participants-list.component';

export const routes: Routes = [
  { path: '', component: ParticipantsListComponent },
];
=======
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
];

>>>>>>> Stashed changes
