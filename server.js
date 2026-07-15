const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '5mb' }));

// ─── Data Store ──────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data', 'cron-logs.json');

function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { crons: [], timeline: [], lastUpdated: null };
  }
}

function saveData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  saveData({ crons: [], timeline: [], lastUpdated: null });
}

// ─── API Routes ──────────────────────────────────────────────

// Webhook: receive cron data from collector
app.post('/api/ingest', (req, res) => {
  const { crons, timeline, date } = req.body;
  if (!crons || !timeline) return res.status(400).json({ error: 'Missing crons or timeline' });

  const data = loadData();
  const dateKey = date || new Date().toISOString().slice(0, 10);

  // Merge: keep last 30 days, deduplicate by jobId+runAt
  data.crons = data.crons.filter(c => c.date !== dateKey);
  data.crons.push(...crons.map(c => ({ ...c, date: dateKey })));
  // Keep only last 500 entries
  data.crons = data.crons.slice(-500);

  // Timeline: dedup by date
  data.timeline = data.timeline.filter(t => t.date !== dateKey);
  data.timeline.push(...timeline.map(t => ({ ...t, date: dateKey })));
  data.timeline = data.timeline.slice(-90);

  data.lastUpdated = new Date().toISOString();
  saveData(data);

  res.json({ ok: true, stored: crons.length + timeline.length });
});

// GET: all data
app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json(data);
});

// GET: summary stats
app.get('/api/summary', (req, res) => {
  const data = loadData();
  const total = data.crons.length;
  const ok = data.crons.filter(c => c.status === 'ok').length;
  const errors = data.crons.filter(c => c.status === 'error').length;

  // Group by day
  const byDay = {};
  data.crons.forEach(c => {
    const d = c.date || 'unknown';
    if (!byDay[d]) byDay[d] = { date: d, total: 0, ok: 0, error: 0 };
    byDay[d].total++;
    byDay[d][c.status]++;
  });

  // Group by job name
  const byJob = {};
  data.crons.forEach(c => {
    const name = c.displayName || c.jobName || 'unknown';
    if (!byJob[name]) byJob[name] = { name, total: 0, ok: 0, error: 0, avgDuration: 0, totalTokens: 0 };
    byJob[name].total++;
    byJob[name][c.status]++;
    byJob[name].avgDuration += c.durationMs || 0;
    byJob[name].totalTokens += c.totalTokens || 0;
  });
  Object.values(byJob).forEach(j => {
    j.avgDuration = j.total > 0 ? Math.round(j.avgDuration / j.total) : 0;
  });

  // Latest runs
  const latest = [...data.crons].sort((a, b) => new Date(b.runAt) - new Date(a.runAt)).slice(0, 20);

  res.json({
    total,
    ok,
    errors,
    errorRate: total > 0 ? Math.round((errors / total) * 100) : 0,
    byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
    byJob: Object.values(byJob),
    latest,
    lastUpdated: data.lastUpdated
  });
});

// POST: manual push from local collector
app.post('/api/push', (req, res) => {
  const { crons, timeline } = req.body;
  if (!crons) return res.status(400).json({ error: 'Missing crons' });

  const data = loadData();
  data.crons.push(...crons.map(c => ({ ...c, date: c.date || new Date().toISOString().slice(0, 10) })));
  if (timeline) data.timeline.push(...timeline);
  data.lastUpdated = new Date().toISOString();
  saveData(data);

  res.json({ ok: true, stored: crons.length + (timeline || []).length });
});

// ─── Serve dashboard ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`PIPO Dashboard running on http://localhost:${PORT}`);
});
