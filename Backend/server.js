const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/', (req, res) => {
  res.send({ status: 'ok', message: 'Backend for Peserta Khusus Bahasa Inggris' });
});

// List participants
app.get('/api/participants', (req, res) => {
  const participants = readData();
  res.json(participants);
});

// Get single participant
app.get('/api/participants/:id', (req, res) => {
  const participants = readData();
  const id = Number(req.params.id);
  const item = participants.find((p) => p.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Create participant
app.post('/api/participants', (req, res) => {
  const participants = readData();
  const payload = req.body || {};
  const nextId = participants.length ? Math.max(...participants.map((p) => p.id || 0)) + 1 : 1;
  const newItem = Object.assign({ id: nextId }, payload);
  participants.push(newItem);
  writeData(participants);
  res.status(201).json(newItem);
});

// Allow updating (simple replace)
app.put('/api/participants/:id', (req, res) => {
  const participants = readData();
  const id = Number(req.params.id);
  const idx = participants.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  participants[idx] = Object.assign({ id }, req.body || {});
  writeData(participants);
  res.json(participants[idx]);
});

// Delete
app.delete('/api/participants/:id', (req, res) => {
  let participants = readData();
  const id = Number(req.params.id);
  const before = participants.length;
  participants = participants.filter((p) => p.id !== id);
  if (participants.length === before) return res.status(404).json({ error: 'Not found' });
  writeData(participants);
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
