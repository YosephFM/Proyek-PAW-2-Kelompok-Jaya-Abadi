import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  @Output() success = new EventEmitter<void>();

  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService) {}

  login(): void {
    if (this.auth.login(this.username, this.password)) {
    window.location.href = '/dashboard';

      this.success.emit(); // 🔥 trigger dashboard
    } else {
      this.error = 'Username atau password salah';
    }
  }
}
