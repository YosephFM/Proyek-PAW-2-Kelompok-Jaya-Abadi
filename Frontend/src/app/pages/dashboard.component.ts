import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ParticipantService } from '../services/participant.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  participants = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingId = signal<string | null>(null);
  formData = signal({ name: '', email: '', phone: '', level: 'Beginner', days: '', time: '' });

  constructor(private svc: ParticipantService) {
    this.load();
  }

  getInitials(name: string) {
    if (!name) return '';
    return name
      .split(' ')
      .map(s => s.trim()[0] || '')
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.svc.getAll().subscribe({
      next: data => this.participants.set(Array.isArray(data) ? data : []),
      error: err => this.error.set(err?.error?.message || 'Gagal memuat peserta'),
      complete: () => this.loading.set(false)
    });
  }

  openForm(p?: any) {
    if (p) {
      this.editingId.set(p._id || p.id || null);
      this.formData.set({
        name: p.name || '',
        email: p.email || '',
        phone: p.phone || '',
        level: p.level || 'Beginner',
        days: p.days || '',
        time: p.time || ''
      });
    } else {
      this.editingId.set(null);
      this.formData.set({ name: '', email: '', phone: '', level: 'Beginner', days: '', time: '' });
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  updateForm(key: string, value: any) {
    this.formData.update(f => ({ ...f, [key]: value }));
  }

  save() {
    const payload = this.formData();
    if (this.editingId()) {
      const id = this.editingId() as string;
      this.svc.update(id, payload).subscribe({
        next: () => { this.load(); this.closeForm(); },
        error: () => this.error.set('Gagal memperbarui peserta')
      });
    } else {
      this.svc.create(payload).subscribe({
        next: () => { this.load(); this.closeForm(); },
        error: () => this.error.set('Gagal membuat peserta')
      });
    }
  }

  delete(p: any) {
    if (!confirm(`Hapus peserta ${p.name}?`)) return;
    const id = p._id || p.id;
    this.svc.delete(id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Gagal menghapus peserta')
    });
  }
}
