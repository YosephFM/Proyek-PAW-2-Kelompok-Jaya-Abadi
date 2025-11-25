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
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* Routes */

// GET all participants
app.get('/api/participants', (req, res) => {
  const data = readData();
  res.json(data);
});

// GET participant by id (_id)
app.get('/api/participants/:id', (req, res) => {
  const data = readData();
  const p = data.find(d => d._id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// CREATE participant
app.post('/api/participants', (req, res) => {
  try {
    const data = readData();
    const payload = req.body || {};
    const doc = {
      _id: payload._id || makeId(),
      name: payload.name || '',
      email: payload.email || '',
      phone: payload.phone || '',
      level: payload.level || '',
      days: payload.days || '',
      time: payload.time || '',
      createdAt: new Date().toISOString(),
      lastActive: payload.lastActive || null
    };
    data.push(doc);
    writeData(data);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'write error' });
  }
});

// UPDATE participant
app.put('/api/participants/:id', (req, res) => {
  try {
    const data = readData();
    const idx = data.findIndex(d => d._id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const payload = req.body || {};
    data[idx] = Object.assign({}, data[idx], {
      name: payload.name ?? data[idx].name,
      email: payload.email ?? data[idx].email,
      phone: payload.phone ?? data[idx].phone,
      level: payload.level ?? data[idx].level,
      days: payload.days ?? data[idx].days,
      time: payload.time ?? data[idx].time,
      lastActive: payload.lastActive ?? data[idx].lastActive
    });
    writeData(data);
    res.json(data[idx]);
  } catch (err) {
    res.status(500).json({ error: 'update error' });
  }
});

// DELETE participant
app.delete('/api/participants/:id', (req, res) => {
  try {
    const data = readData();
    const filtered = data.filter(d => d._id !== req.params.id);
    if (filtered.length === data.length) return res.status(404).json({ error: 'Not found' });
    writeData(filtered);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'delete error' });
  }
});

// POST message (no persistence)
app.post('/api/participants/:id/messages', (req, res) => {
  console.log('message to', req.params.id, req.body);
  res.json({ ok: true });
});

// CSV export
app.get('/api/participants/export', (req, res) => {
  try {
    const data = readData();
    const headers = ['_id','name','email','phone','level','days','time','lastActive','createdAt'];
    const rows = data.map(d => headers.map(h => `"${String(d[h] ?? '').replace(/"/g,'""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="participants.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'export error' });
  }
});

/* start server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}/api/participants`));