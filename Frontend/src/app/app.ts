import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParticipantService } from './services/participant.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Frontend');

  participants = signal<any[]>([]);
  loading = signal(false);
  error = signal('');
  showForm = signal(false);
  editingId = signal('');

  // form data
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
      // update
      this.svc.update(id, form).subscribe({
        next: () => { this.load(); this.closeForm(); },
        error: err => alert('Gagal update: ' + err.error?.error || err.message)
      });
    } else {
      // create
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
