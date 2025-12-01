import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParticipantsService, Participant } from './participants.service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'participants-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(8px) scale(.995)' }),
          stagger('50ms', [animate('280ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'none' }))])
        ], { optional: true }),
        query(':leave', [
          stagger('30ms', [animate('200ms ease', style({ opacity: 0, transform: 'translateY(-6px) scale(.995)' }))])
        ], { optional: true })
      ])
    ]),
    trigger('rowState', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(6px) scale(.995)' }),
        animate('280ms cubic-bezier(.2,.8,.2,1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [animate('200ms ease', style({ opacity: 0, transform: 'translateY(-8px) scale(.995)' }))])
    ])
  ]
})
export class ParticipantsListComponent implements OnInit {
  participants: Participant[] = [];
  loading = false;
  filter = '';

  // form model
  formName = '';
  formEmail = '';
  formLevel = '';
  formHari = 'Senin - Rabu';
  formJam = '09:00 - 11:00';
  formTanggal = '';
  editingId: number | null = null;
  saving = false;

  // touched flags for validation
  formNameTouched = false;
  formEmailTouched = false;
  formJamTouched = false;
  formHariTouched = false;
  formTanggalTouched = false;
  formLevelTouched = false;

  // validation getters
  get isNameValid() {
    return (this.formName || '').trim().length >= 2;
  }

  get isEmailValid() {
    const v = (this.formEmail || '').trim();
    if (!v) return false;
    // simple email regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(v);
  }

  private parseHHMM(s: string) {
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
  }

  get isJamFormatValid() {
    const v = (this.formJam || '').trim();
    const parts = v.split('-').map((p) => p.trim());
    if (parts.length !== 2) return false;
    const start = this.parseHHMM(parts[0]);
    const end = this.parseHHMM(parts[1]);
    if (start === null || end === null) return false;
    return start < end;
  }

  get isHariValid() {
    return !!(this.formHari || '').trim();
  }

  get isFormValid() {
    return this.isNameValid && this.isEmailValid && this.isJamFormatValid && this.isHariValid && this.isTanggalValid && this.isLevelValid;
  }

  get isLevelValid() {
    return !!(this.formLevel || '').trim();
  }

  get isTanggalValid() {
    // simple presence check; HTML date input gives yyyy-mm-dd when present
    return !!(this.formTanggal || '').trim();
  }

  constructor(private svc: ParticipantsService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.svc.list().subscribe({
      next: (data) => (this.participants = data || []),
      error: () => (this.participants = []),
      complete: () => (this.loading = false)
    });
  }

  get filtered() {
    const q = (this.filter || '').trim().toLowerCase();
    if (!q) return this.participants;
    return this.participants.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q)
    );
  }

  /** live preview object: shows when user has started typing some fields */
  get preview(): Participant | null {
    const name = (this.formName || '').trim();
    const email = (this.formEmail || '').trim();
    const hari = (this.formHari || '').trim();
    const jam = (this.formJam || '').trim();
    const tanggal = (this.formTanggal || '').trim();
    const level = (this.formLevel || '').trim();
    // show preview if any meaningful field is present OR level is chosen
    if (!name && !email && !hari && !jam && !tanggal && !level) return null;
    return {
      id: -1,
      name,
      email,
      hari,
      jam,
      tanggal,
      level: level || ''
    } as Participant;
  }

  startAdd() {
    this.editingId = null;
    this.formName = '';
    this.formEmail = '';
    this.formLevel = '';
    this.formHari = 'Senin - Rabu';
    this.formJam = '09:00 - 11:00';
    this.formTanggal = '';
    this.formNameTouched = this.formEmailTouched = this.formJamTouched = this.formHariTouched = this.formTanggalTouched = this.formLevelTouched = false;
  }

  startEdit(p: Participant) {
    this.editingId = p.id;
    this.formName = p.name;
    this.formEmail = p.email || '';
    this.formLevel = p.level || '';
    this.formHari = p.hari || 'Senin - Rabu';
    this.formJam = p.jam || '09:00 - 11:00';
    this.formTanggal = p.tanggal || '';
    this.formNameTouched = this.formEmailTouched = this.formJamTouched = this.formHariTouched = this.formTanggalTouched = this.formLevelTouched = false;
  }

  cancelEdit() {
    this.startAdd();
  }

  save() {
    const payload: Partial<Participant> = {
      name: this.formName,
      email: this.formEmail,
      level: this.formLevel
      , hari: this.formHari,
      jam: this.formJam,
      tanggal: this.formTanggal
    };

    // mark touched so validation messages appear
    this.formNameTouched = this.formEmailTouched = this.formJamTouched = this.formHariTouched = this.formTanggalTouched = true;
    this.formLevelTouched = true;
    if (!this.isFormValid) return;

    this.saving = true;

    if (this.editingId) {
      this.svc.update(this.editingId, payload).subscribe({
        next: () => this.load(),
        error: () => (this.saving = false),
        complete: () => {
          this.saving = false;
          this.startAdd();
        }
      });
    } else {
      this.svc.create(payload).subscribe({
        next: () => this.load(),
        error: () => (this.saving = false),
        complete: () => {
          this.saving = false;
          this.startAdd();
        }
      });
    }
  }

  deleteParticipant(id: number) {
    if (!confirm('Hapus peserta ini?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load() });
  }
}
