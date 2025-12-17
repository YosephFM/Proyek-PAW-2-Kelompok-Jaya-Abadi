import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterModule, provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParticipantService } from './services/participant.service';
import { DashboardComponent } from './dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< Updated upstream
  imports: [RouterOutlet, RouterModule, CommonModule, FormsModule],
  template: `
    <nav class="nav">
      <div class="nav-brand">Kursus Bahasa Inggris Jaya Abadi</div>
      <div class="nav-links">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/data" routerLinkActive="active">Data Peserta</a>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .nav { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #fff; border-bottom: 1px solid #e2e8f0; }
    .nav-brand { font-weight: 700; font-size: 18px; }
    .nav-links { display: flex; gap: 16px; }
    .nav-links a { text-decoration: none; color: #64748b; padding: 8px 12px; border-radius: 6px; transition: all 0.2s; }
    .nav-links a.active, .nav-links a:hover { background: linear-gradient(90deg, #06b6d4, #7c3aed); color: #fff; }
  `]
=======
  imports: [RouterOutlet, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
>>>>>>> Stashed changes
})
export class App implements OnInit {
  protected readonly title = signal('Frontend');

  participants = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingId = signal('');

  formData = signal({
    name: '',
    email: '',
    phone: '',
    level: 'Beginner',
    days: '',
    time: ''
  });

  constructor(private svc: ParticipantService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.svc.getAll().subscribe({
      next: data => this.participants.set(Array.isArray(data) ? data : []),
      error: err => {
        console.error(err);
        this.error.set('Gagal memuat data');
        this.participants.set([]);
      },
      complete: () => this.loading.set(false)
    });
  }

  openForm(p?: any): void {
    if (p) {
      this.editingId.set(p._id);
      this.formData.set({ ...p });
    } else {
      this.editingId.set('');
      this.formData.set({ name: '', email: '', phone: '', level: 'Beginner', days: '', time: '' });
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingId.set('');
  }

  save(): void {
    const form = this.formData();
    if (!form.name || !form.email || !form.phone) {
      alert('Semua field wajib diisi');
      return;
    }

    const id = this.editingId();
    if (id) {
      this.svc.update(id, form).subscribe({
        next: () => { this.load(); this.closeForm(); },
        error: err => alert('Gagal update: ' + err.error?.error || err.message)
      });
    } else {
      this.svc.create(form).subscribe({
        next: () => { this.load(); this.closeForm(); },
        error: err => alert('Gagal tambah: ' + err.error?.error || err.message)
      });
    }
  }

  delete(p: any): void {
    if (!confirm(`Hapus ${p.name}?`)) return;
    this.svc.delete(p._id).subscribe({
      next: () => this.load(),
      error: err => alert('Gagal hapus: ' + err.error?.error || err.message)
    });
  }

  updateForm(key: string, val: string): void {
    const form = { ...this.formData() };
    form[key as keyof typeof form] = val;
    this.formData.set(form);
  }

  getInitials(name: string): string {
    return (name || '')
      .split(' ')
      .map(n => n[0] || '')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}

// Provide routing and HttpClient with fetch
export const appConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'data', component: App }
    ]),
    provideHttpClient(withFetch())
  ]
};
