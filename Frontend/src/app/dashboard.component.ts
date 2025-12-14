import { Component, OnInit, signal } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ParticipantService } from './services/participant.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      <div *ngIf="loading()" class="loading">Memuat data…</div>
      <div *ngIf="error()" class="error">{{ error() }}</div>

      <div *ngIf="!loading() && summary()" class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ summary().totalParticipants }}</div>
          <div class="stat-label">Total Peserta</div>
        </div>

        <div class="stat-card" *ngFor="let level of getLevels()">
          <div class="stat-number">{{ level.count }}</div>
          <div class="stat-label">{{ level.name }}</div>
        </div>
      </div>

      <div *ngIf="!loading() && recent().length" class="recent-section">
        <h3>Peserta Terbaru</h3>
        <div class="recent-list">
          <div class="recent-item" *ngFor="let p of recent()">
            <div class="avatar">{{ getInitials(p.name) }}</div>
            <div class="info">
              <div class="name">{{ p.name }}</div>
              <div class="email">{{ p.email }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 6px 16px rgba(12, 15, 30, 0.04); text-align: center; }
    .stat-number { font-size: 32px; font-weight: 700; color: #06b6d4; }
    .stat-label { color: #64748b; margin-top: 8px; }
    .recent-section h3 { margin-bottom: 16px; }
    .recent-list { display: flex; flex-direction: column; gap: 12px; }
    .recent-item { display: flex; gap: 12px; align-items: center; background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(12, 15, 30, 0.04); }
    .avatar { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #06b6d4, #7c3aed); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .info { flex: 1; }
    .name { font-weight: 600; }
    .email { color: #64748b; font-size: 14px; }
    .loading, .error { text-align: center; color: #64748b; padding: 20px; }
    .error { color: #ef4444; }
  `]
})
export class DashboardComponent implements OnInit {
  summary = signal<any>(null);
  recent = signal<any[]>([]);
  loading = signal(false);
  error = signal('');

  constructor(private svc: ParticipantService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.svc.getDashboard().subscribe({
      next: data => {
        this.summary.set(data);
        this.recent.set(data.recent || []);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.error.set('Gagal memuat dashboard');
        this.loading.set(false);
      }
    });
  }

  getLevels(): any[] {
    const levels = this.summary()?.levels || {};
    return Object.keys(levels).map(name => ({ name, count: levels[name] }));
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