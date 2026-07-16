#!/bin/bash
# ==============================================================
# PIPO Dashboard — Atualização Automática de Dados
# ==============================================================
# Uso: ./scripts/atualizar-dados.sh
# Agende no cron do OpenClaw ou crontab do WSL
# ==============================================================
# Crontab example (WSL):
#   */30 * * * * cd /home/joaomunoz/dashboard-pipo && bash scripts/atualizar-dados.sh
# ==============================================================

set -euo pipefail
cd "$(dirname "$0")/.."

DATA_FILE="public/data/vault-summary.json"
REPO_DIR="$(pwd)"
VAULT_DIR="$HOME/vault"
LOG_FILE="logs/atualizar.log"

mkdir -p logs

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "🔄 Iniciando atualização dos dados do dashboard..."

# ─── 1. Contar notas do vault ────────────────────────────────
log "📂 Coletando dados do vault..."

generate_data() {
  cat <<EOF
{
  "generatedAt": "$(date '+%Y-%m-%dT%H:%M:%S-03:00')",
  "vault": {
    "totalMdFiles": 0,
    "totalFiles": 0,
    "totalSizeBytes": 0,
    "folders": {}
  },
  "system": {
    "model": "$(openclaw model 2>/dev/null || echo 'unknown')",
    "timezone": "America/Sao_Paulo",
    "platform": "OpenClaw on WSL2 (Ubuntu)",
    "nodeVersion": "$(node --version 2>/dev/null || echo 'unknown')"
  },
  "crons": { "total": 0, "active": 0, "errors": 0, "idle": 0, "jobs": [] },
  "projetos": { "total": 0, "active": [] },
  "ecosystem": {
    "github": { "connected": true, "repo": "joao-munoz/dashboard-pipo", "branch": "main" },
    "render": { "url": "https://dashboard-pipo.onrender.com", "status": "deployed" }
  },
  "recentFiles": []
}
EOF
}

# Count vault files
TOTAL_MD=0
TOTAL_FILES=0
TOTAL_SIZE=0
FOLDERS_DATA="{"

for folder in inbox Sites IA projetos diario pessoal descobertas repos; do
  if [ -d "$VAULT_DIR/$folder" ]; then
    MD_COUNT=$(find "$VAULT_DIR/$folder" -name "*.md" -type f 2>/dev/null | wc -l)
    FILE_COUNT=$(find "$VAULT_DIR/$folder" -type f 2>/dev/null | wc -l)
    SIZE=$(find "$VAULT_DIR/$folder" -type f -exec stat --format='%s' {} \; 2>/dev/null | awk '{s+=$1} END {print s+0}')
    
    TOTAL_MD=$((TOTAL_MD + MD_COUNT))
    TOTAL_FILES=$((TOTAL_FILES + FILE_COUNT))
    TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
    
    # Map folder name to label
    case $folder in
      inbox) LABEL="Inbox";;
      Sites) LABEL="Sites";;
      IA) LABEL="IA";;
      projetos) LABEL="Projetos";;
      diario) LABEL="Diário";;
      pessoal) LABEL="Pessoal";;
      descobertas) LABEL="Descobertas";;
      repos) LABEL="Repositórios";;
      *) LABEL="$folder";;
    esac
    
    FOLDERS_DATA+="\"$folder\": { \"mdFiles\": $MD_COUNT, \"files\": $FILE_COUNT, \"sizeBytes\": $SIZE, \"label\": \"$LABEL\" },"
  fi
done
FOLDERS_DATA="${FOLDERS_DATA%,}}"

# ─── 2. Coletar dados dos crons (OpenClaw) ──────────────────
log "⏰ Coletando status dos crons..."
CRON_DATA=""
if command -v openclaw &>/dev/null; then
  CRON_DATA=$(openclaw cron list --json 2>/dev/null || openclaw cron list 2>/dev/null)
fi

CRON_TOTAL=0
CRON_OK=0
CRON_ERROR=0
CRON_IDLE=0

if [ -n "$CRON_DATA" ]; then
  # Parse from text output
  CRON_TOTAL=$(echo "$CRON_DATA" | grep -c '^\S' 2>/dev/null || echo 0)
  CRON_OK=$(echo "$CRON_DATA" | grep -c '\sok\s' 2>/dev/null || echo 0)
  CRON_ERROR=$(echo "$CRON_DATA" | grep -c '\serror' 2>/dev/null || echo 0)
  CRON_IDLE=$(echo "$CRON_DATA" | grep -c '\sidle' 2>/dev/null || echo 0)
fi

# ─── 3. Coletar arquivos recentes ───────────────────────────
log "📝 Coletando arquivos recentes..."
RECENT_FILES=$(find "$VAULT_DIR" -name "*.md" -type f -newermt "$(date -d '7 days ago' '+%Y-%m-%d')" 2>/dev/null | head -20)

# ─── 4. Gerar JSON final ────────────────────────────────────
log "💾 Gerando $DATA_FILE..."

python3 <<PYEOF
import json, os, subprocess
from datetime import datetime, timezone, timedelta

vault_dir = os.path.expanduser("$VAULT_DIR")
tz_sp = timezone(timedelta(hours=-3))
now = datetime.now(tz_sp).strftime('%Y-%m-%dT%H:%M:%S-03:00')

folders = {}
total_md = 0
total_files = 0
total_size = 0
folder_labels = {
    'inbox': 'Inbox', 'Sites': 'Sites', 'IA': 'IA', 'projetos': 'Projetos',
    'diario': 'Diário', 'pessoal': 'Pessoal', 'descobertas': 'Descobertas', 'repos': 'Repositórios'
}
folder_order = ['inbox', 'Sites', 'IA', 'projetos', 'diario', 'pessoal', 'descobertas', 'repos']

for folder in folder_order:
    path = os.path.join(vault_dir, folder)
    if os.path.isdir(path):
        md_files = []
        files = []
        size = 0
        for root, dirs, fnames in os.walk(path):
            for fname in fnames:
                fpath = os.path.join(root, fname)
                try:
                    sz = os.path.getsize(fpath)
                    size += sz
                    files.append(fpath)
                    if fname.endswith('.md'):
                        md_files.append(fpath)
                except:
                    pass
        label = folder_labels.get(folder, folder)
        folders[folder] = {
            "mdFiles": len(md_files),
            "files": len(files),
            "sizeBytes": size,
            "label": label
        }
        total_md += len(md_files)
        total_files += len(files)
        total_size += size

# Recent files
recent = []
cutoff = datetime.now() - timedelta(days=7)
for root, dirs, fnames in os.walk(vault_dir):
    for fname in fnames:
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(root, fname)
        try:
            mtime = os.path.getmtime(fpath)
            if datetime.fromtimestamp(mtime) > cutoff:
                rel = os.path.relpath(fpath, vault_dir)
                recent.append({
                    "path": rel,
                    "modified": datetime.fromtimestamp(mtime, tz=tz_sp).strftime('%Y-%m-%dT%H:%M:%S-03:00'),
                    "size": os.path.getsize(fpath)
                })
        except:
            pass
recent.sort(key=lambda x: x['modified'], reverse=True)

data = {
    "generatedAt": now,
    "vault": {
        "totalMdFiles": total_md,
        "totalFiles": total_files,
        "totalSizeBytes": total_size,
        "folders": folders
    },
    "system": {
        "model": "opencode/deepseek-v4-flash-free",
        "modelPro": "opencode/deepseek-v4-pro",
        "timezone": "America/Sao_Paulo",
        "platform": "OpenClaw on WSL2 (Ubuntu)",
        "nodeVersion": "v24.18.0"
    },
    "crons": {
        "total": $CRON_TOTAL,
        "active": $((CRON_TOTAL - CRON_IDLE)),
        "errors": $CRON_ERROR,
        "idle": $CRON_IDLE
    },
    "projetos": {
        "total": 6,
        "active": [
            {"name": "PIPO Dashboard", "status": "ativo", "progress": 90},
            {"name": "TikTok Shop Afiliado IA", "status": "planejamento", "progress": 15},
            {"name": "Flightclaw + Pipo Travel Bot", "status": "ativo", "progress": 70},
            {"name": "Second Brain (Obsidian Vault)", "status": "ativo", "progress": 60},
            {"name": "n8n Automação", "status": "ativo", "progress": 30},
            {"name": "Inbox Zero Automatizado", "status": "ativo", "progress": 85}
        ]
    },
    "ecosystem": {
        "github": {"connected": True, "repo": "joao-munoz/dashboard-pipo", "branch": "main"},
        "render": {"url": "https://dashboard-pipo.onrender.com", "status": "deployed"}
    },
    "recentFiles": recent[:15]
}

os.makedirs(os.path.dirname('$DATA_FILE'), exist_ok=True)
with open('$DATA_FILE', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"  ✅ Vault: {total_md} .md files, {total_files} total, {total_size} bytes")
print(f"  ✅ Crons: {data['crons']['total']} total, {data['crons']['active']} active")
print(f"  ✅ Recentes: {len(recent)} arquivos modificados")
PYEOF

# ─── 5. Commit e push ───────────────────────────────────────
log "📤 Fazendo commit e push..."
git add -A
git commit -m "chore: atualização automática dashboard $(date '+%Y-%m-%d_%H:%M')" 2>/dev/null || log "  ℹ️  Nada novo para commitar"
git push origin main 2>&1 | tee -a "$LOG_FILE"

log "✅ Atualização concluída!"
echo ""
echo "📊 Dashboard: https://dashboard-pipo.onrender.com/dashboard.html"
