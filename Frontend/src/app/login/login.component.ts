import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
selector: 'app-login',
standalone: true,
imports: [FormsModule],
templateUrl: './login.component.html',
styleUrl: './login.component.css'
})
export class LoginComponent {
username = '';
password = '';
error = '';


constructor(private router: Router) {}


login(): void {
if (this.username === 'admin' && this.password === 'admin') {
localStorage.setItem('isLogin', 'true');
this.router.navigate(['/dashboard']);
return;
}


this.error = 'Username atau password salah';
}
}