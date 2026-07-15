#!/usr/bin/env node
/**
 * PIPO Cron Data Collector
 * 
 * Roda localmente (WSL) em um cron, coleta dados dos crons
 * via OpenClaw API e envia pro dashboard no Render.
 * 
 * Uso: node scripts/collect.cjs
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3001';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:6400';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

// ─── HTTP helper ─────────────────────────────────────────────
function fetch(method, url, body = null, token = '') {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === 'https:' ? https : http;
    const opts = {
      method,
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));

    const req = mod.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── Collect from OpenClaw ──────────────────────────────────
async function collect() {
  // First, get list of cron jobs
  const url = `${GATEWAY_URL}/api/scheduler/jobs`;
  const result = await fetch('GET', url, null, GATEWAY_TOKEN);
  
  const jobs = result.jobs || [];
  const crons = [];
  const timeline = [];

  for (const job of jobs) {
    if (!job.name) continue;
    
    // Get run history for each job
    try {
      const runsUrl = `${GATEWAY_URL}/api/scheduler/jobs/${job.id}/runs`;
      const runs = await fetch('GET', runsUrl, null, GATEWAY_TOKEN);
      const entries = runs.entries || [];

      for (const run of entries) {
        const entry = {
          jobId: job.id,
          jobName: job.name,
          displayName: job.displayName || job.name,
          status: run.status === 'ok' ? 'ok' : 'error',
          error: run.error || null,
          durationMs: run.durationMs || 0,
          totalTokens: run.usage ? (run.usage.input_tokens || 0) + (run.usage.output_tokens || 0) : 0,
          inputTokens: run.usage ? run.usage.input_tokens : 0,
          outputTokens: run.usage ? run.usage.output_tokens : 0,
          model: run.model || run.provider || null,
          runAt: new Date(run.runAtMs || run.ts).toISOString(),
          summary: (run.summary || '').slice(0, 300),
          delivered: run.delivered || false
        };
        crons.push(entry);

        // Build timeline entry per day
        const day = entry.runAt.slice(0, 10);
        const existing = timeline.find(t => t.date === day);
        if (existing) {
          existing.total++;
          if (entry.status === 'ok') existing.ok++;
          else existing.error++;
        } else {
          timeline.push({ date: day, total: 1, ok: entry.status === 'ok' ? 1 : 0, error: entry.status === 'error' ? 1 : 0 });
        }
      }
    } catch (err) {
      console.error(`  ⚠️  Erro ao buscar runs do job ${job.name}: ${err.message}`);
    }
  }

  return { crons, timeline, date: new Date().toISOString().slice(0, 10) };
}

// ─── Push to dashboard ───────────────────────────────────────
async function push(data) {
  const url = `${DASHBOARD_URL}/api/ingest`;
  const result = await fetch('POST', url, data);
  return result;
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log(`[${new Date().toISOString()}] PIPO Collector iniciando...`);
  console.log(`  Gateway: ${GATEWAY_URL}`);
  console.log(`  Dashboard: ${DASHBOARD_URL}`);

  console.log('  Coletando dados dos crons...');
  const data = await collect();
  console.log(`  Coletados ${data.crons.length} registros de execução`);

  console.log('  Enviando para o dashboard...');
  const result = await push(data);
  console.log(`  Resultado: ${JSON.stringify(result)}`);

  console.log('  ✅ Coleta concluída');
  process.exit(0);
}

main().catch(err => {
  console.error('  ❌ Erro fatal:', err.message);
  process.exit(1);
});
