import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantService } from '../services/participant.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  participants = signal<any[]>([]);
  loading = signal(false);
  error = signal('');

  showForm = signal(false);
  editingId = signal<string | null>(null);

  formData = signal({
    name: '',
    email: '',
    phone: '',
    level: 'Beginner',
    days: '',
    time: ''
  });

  constructor(private svc: ParticipantService) {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: data => this.participants.set(data ?? []),
      error: () => this.error.set('Gagal memuat data'),
      complete: () => this.loading.set(false)
    });
  }

  openForm(p?: any) {
    if (p) {
      this.editingId.set(p._id);
      this.formData.set({ ...p });
    } else {
      this.editingId.set(null);
      this.formData.set({
        name: '',
        email: '',
        phone: '',
        level: 'Beginner',
        days: '',
        time: ''
      });
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
      this.svc.update(this.editingId()!, payload).subscribe(() => {
        this.load();
        this.closeForm();
      });
    } else {
      this.svc.create(payload).subscribe(() => {
        this.load();
        this.closeForm();
      });
    }
  }

  delete(p: any) {
    if (!confirm('Hapus peserta ini?')) return;
    this.svc.delete(p._id).subscribe(() => this.load());
  }

  getInitials(name: string) {
    return name?.split(' ').map((x: string) => x[0]).join('').slice(0,2).toUpperCase();
  }
}
