import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common'; // Diperlukan untuk *ngFor, *ngIf
import { FormsModule } from '@angular/forms';

// Definisi interface sederhana untuk data
interface Item {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html' // Pastikan HTML disesuaikan
})
export class LoginComponent {
  // State untuk Login
  username = '';
  password = '';
  error = '';
  isLoggedIn = false; // Flag sederhana untuk demo

  // State untuk CRUD
  items: Item[] = []; // Array penampung data
  inputName = '';     // Model untuk input form
  editingId: number | null = null; // Penanda item mana yang sedang diedit

  constructor(private auth: AuthService, private router: Router) {}

  // --- LOGIKA LOGIN ---
  login() {
    if (this.auth.login(this.username, this.password)) {
      // Jika menggunakan router: this.router.navigate(['/dashboard']);
      // Untuk demo satu file ini, kita ubah flag saja:
      this.isLoggedIn = true; 
      this.loadData(); // Load data dummy saat login berhasil
    } else {
      this.error = 'Username atau password salah';
    }
  }

  // --- LOGIKA CRUD ---

  // 0. Read (Simulasi ambil data awal)
  loadData() {
    this.items = [
      { id: 1, name: 'Item Pertama' },
      { id: 2, name: 'Item Kedua' }
    ];
  }

  // 1. Create (Membuat data baru)
  createItem(): void {
    if (!this.inputName.trim()) return;

    const newItem: Item = {
      id: Date.now(), // Generate ID unik sederhana
      name: this.inputName.trim()
    };

    this.items = [...this.items, newItem];
    this.resetForm();
  }

  // Backwards-compatible alias
  create(): void { this.createItem(); }

  // 2. Edit (Menyiapkan data untuk diedit)
  startEdit(item: Item): void {
    this.editingId = item.id;
    this.inputName = item.name; // Copy nama ke input field
  }

  // Backwards-compatible alias
  edit(item: Item): void { this.startEdit(item); }

  // 3. Update (Menyimpan perubahan)
  updateItem(): void {
    if (this.editingId === null) return;

    const idToUpdate = this.editingId;

    this.items = this.items.map(item =>
      item.id === idToUpdate ? { ...item, name: this.inputName.trim() } : item
    );

    this.resetForm();
  }

  // Backwards-compatible alias
  update(): void { this.updateItem(); }

  // 4. Delete (Menghapus data)
  deleteItem(id: number): void {
    if (window.confirm('Yakin ingin menghapus item ini?')) {
      this.items = this.items.filter(item => item.id !== id);

      if (this.editingId === id) {
        this.resetForm();
      }
    }
  }

  // Backwards-compatible alias
  delete(id: number): void { this.deleteItem(id); }

  // Helper untuk membersihkan form
  resetForm() {
    this.inputName = '';
    this.editingId = null;
  }
}