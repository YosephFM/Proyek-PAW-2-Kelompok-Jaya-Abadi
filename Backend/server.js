const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    
    // cek apakah array langsung
    if (Array.isArray(parsed)) return parsed;
    
    // cek wrapper object dengan key "Peserta " (perhatikan spasi)
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed['Peserta '])) return parsed['Peserta '];
      if (Array.isArray(parsed.Peserta)) return parsed.Peserta;
      if (Array.isArray(parsed.participants)) return parsed.participants;
    }
    
    return [];
  } catch (err) {
    console.error('readData error', err);
    return [];
  }
}

function writeData(data) {
  try {
    // simpan sebagai array biasa untuk cleaner
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('writeData error', err);
    return false;
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function validateParticipant(payload) {
  const errors = [];
  if (!payload.name || String(payload.name).trim().length < 2) errors.push('name required');
  if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) errors.push('valid email required');
  if (!payload.phone || String(payload.phone).trim().length < 6) errors.push('phone required');
  return errors;
}

/* Routes */

// GET all
app.get('/api/participants', (req, res) => {
  const data = readData();
  res.json(data);
});

// GET by id
app.get('/api/participants/:id', (req, res) => {
  const data = readData();
  const p = data.find(d => String(d._id) === String(req.params.id));
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// CREATE
app.post('/api/participants', (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validateParticipant(payload);
    if (errors.length) return res.status(400).json({ error: 'validation', details: errors });

    const data = readData();
    const exists = data.find(d => String(d.email).toLowerCase() === String(payload.email).toLowerCase());
    if (exists) return res.status(409).json({ error: 'email already exists' });

    const doc = {
      _id: payload._id || makeId(),
      name: String(payload.name).trim(),
      email: String(payload.email).trim(),
      phone: String(payload.phone || '').trim(),
      level: String(payload.level || '').trim(),
      days: String(payload.days || '').trim(),
      time: String(payload.time || '').trim(),
      createdAt: new Date().toISOString()
    };
    data.push(doc);
    if (!writeData(data)) return res.status(500).json({ error: 'write error' });
    res.status(201).json(doc);
  } catch (err) {
    console.error('POST error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// UPDATE
app.put('/api/participants/:id', (req, res) => {
  try {
    const payload = req.body || {};
    const data = readData();
    const idx = data.findIndex(d => String(d._id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    if (payload.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) {
      return res.status(400).json({ error: 'invalid email' });
    }

    data[idx] = {
      ...data[idx],
      name: payload.name ?? data[idx].name,
      email: payload.email ?? data[idx].email,
      phone: payload.phone ?? data[idx].phone,
      level: payload.level ?? data[idx].level,
      days: payload.days ?? data[idx].days,
      time: payload.time ?? data[idx].time
    };

    if (!writeData(data)) return res.status(500).json({ error: 'write error' });
    res.json(data[idx]);
  } catch (err) {
    console.error('PUT error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// DELETE
app.delete('/api/participants/:id', (req, res) => {
  try {
    const data = readData();
    const filtered = data.filter(d => String(d._id) !== String(req.params.id));
    if (filtered.length === data.length) return res.status(404).json({ error: 'Not found' });
    if (!writeData(filtered)) return res.status(500).json({ error: 'write error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}/api/participants`));