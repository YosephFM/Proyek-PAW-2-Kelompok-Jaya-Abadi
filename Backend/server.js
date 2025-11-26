const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

/**
 * Read data.json and normalize to an array of participant documents.
 * Supports both:
 *  - top-level array: [ {...}, ... ]
 *  - wrapper object: { "Peserta ": [ {...}, ... ] }
 */
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object') {
      // try common wrapper keys
      if (Array.isArray(parsed.Peserta)) return parsed.Peserta;
      if (Array.isArray(parsed.participants)) return parsed.participants;
      // fallback: collect object values that are arrays
      const arr = Object.values(parsed).find(v => Array.isArray(v));
      if (arr) return arr;
    }
    // otherwise return empty
    return [];
  } catch (err) {
    console.error('readData error', err);
    return [];
  }
}

function writeData(data) {
  try {
    // always write as a plain array (clean format)
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

/* simple validators */
function validateParticipant(payload) {
  const errors = [];
  if (!payload) errors.push('payload required');
  else {
    if (!payload.name || String(payload.name).trim().length < 2) errors.push('name is required');
    if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) errors.push('valid email required');
    if (!payload.phone || String(payload.phone).trim().length < 6) errors.push('phone required');
  }
  return errors;
}

/* Routes */

// GET all participants (support optional ?level=Beginner & search query)
app.get('/api/participants', (req, res) => {
  const { level, q } = req.query;
  let data = readData();
  if (level) data = data.filter(d => String(d.level || '').toLowerCase() === String(level).toLowerCase());
  if (q) {
    const term = q.toLowerCase();
    data = data.filter(d =>
      String(d.name || '').toLowerCase().includes(term) ||
      String(d.email || '').toLowerCase().includes(term) ||
      String(d.phone || '').toLowerCase().includes(term)
    );
  }
  res.json(data);
});

// GET participant by id (_id)
app.get('/api/participants/:id', (req, res) => {
  const data = readData();
  const p = data.find(d => String(d._id) === String(req.params.id));
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// CREATE participant
app.post('/api/participants', (req, res) => {
  try {
    const payload = req.body || {};
    const errors = validateParticipant(payload);
    if (errors.length) return res.status(400).json({ error: 'validation', details: errors });

    const data = readData();
    // prevent duplicate by email
    const exists = data.find(d => String(d.email).toLowerCase() === String(payload.email).toLowerCase());
    if (exists) return res.status(409).json({ error: 'participant with this email already exists' });

    const doc = {
      _id: payload._id || makeId(),
      name: String(payload.name).trim(),
      email: String(payload.email).trim(),
      phone: String(payload.phone || '').trim(),
      level: String(payload.level || '').trim(),
      days: String(payload.days || '').trim(),
      time: String(payload.time || '').trim(),
      createdAt: new Date().toISOString(),
      lastActive: payload.lastActive || null
    };
    data.push(doc);
    if (!writeData(data)) return res.status(500).json({ error: 'write error' });
    res.status(201).json(doc);
  } catch (err) {
    console.error('POST /api/participants error', err);
    res.status(500).json({ error: 'write error' });
  }
});

// UPDATE participant
app.put('/api/participants/:id', (req, res) => {
  try {
    const payload = req.body || {};
    const data = readData();
    const idx = data.findIndex(d => String(d._id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });

    // basic validation if email/name present
    if (payload.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) return res.status(400).json({ error: 'invalid email' });

    data[idx] = Object.assign({}, data[idx], {
      name: payload.name ?? data[idx].name,
      email: payload.email ?? data[idx].email,
      phone: payload.phone ?? data[idx].phone,
      level: payload.level ?? data[idx].level,
      days: payload.days ?? data[idx].days,
      time: payload.time ?? data[idx].time,
      lastActive: payload.lastActive ?? data[idx].lastActive
    });

    if (!writeData(data)) return res.status(500).json({ error: 'write error' });
    res.json(data[idx]);
  } catch (err) {
    console.error('PUT /api/participants/:id error', err);
    res.status(500).json({ error: 'update error' });
  }
});

// DELETE participant
app.delete('/api/participants/:id', (req, res) => {
  try {
    const data = readData();
    const filtered = data.filter(d => String(d._id) !== String(req.params.id));
    if (filtered.length === data.length) return res.status(404).json({ error: 'Not found' });
    if (!writeData(filtered)) return res.status(500).json({ error: 'write error' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE error', err);
    res.status(500).json({ error: 'delete error' });
  }
});

// simple no-persist message endpoint (kept for compatibility)
app.post('/api/participants/:id/messages', (req, res) => {
  console.log('message to', req.params.id, req.body || {});
  res.json({ ok: true });
});

// CSV export
app.get('/api/participants/export', (req, res) => {
  try {
    const data = readData();
    const headers = ['_id', 'name', 'email', 'phone', 'level', 'days', 'time', 'lastActive', 'createdAt'];
    const rows = data.map(d => headers.map(h => `"${String(d[h] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="participants.csv"');
    res.send(csv);
  } catch (err) {
    console.error('export error', err);
    res.status(500).json({ error: 'export error' });
  }
});

// health
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}/api/participants`));