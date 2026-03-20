#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  Deploy YOTEL Masterplan to Vercel
# ═══════════════════════════════════════════════════════════
#
#  Prerequisites:
#    npm install -g vercel     (one-time)
#    vercel login              (one-time)
#
#  Usage:
#    chmod +x deploy.sh
#    ./deploy.sh
#
#  What it does:
#    1. Runs the Python engine to generate fresh options.json
#    2. Builds the React app (npm run build → dist/)
#    3. Deploys to Vercel (gives you a URL)
#
#  After first deploy:
#    - Custom domain: vercel domains add barbados.yourdomain.com
#    - Password: already built in (change PASS in src/main.jsx)
#    - Redeploy:  ./deploy.sh
#
# ═══════════════════════════════════════════════════════════

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  YOTEL Barbados — Deploy to Vercel"
echo "  ══════════════════════════════════"
echo ""

# 1. Generate options
echo "  [1/3] Generating options..."
cd "$ROOT"
python3 backend/run_engine.py --max 30 2>&1 | grep "→\|options"
echo ""

# 2. Build
echo "  [2/3] Building frontend..."
cd "$ROOT/frontend"
npm install --silent 2>&1 | tail -1
npm run build 2>&1 | tail -3
echo ""

# 3. Deploy
echo "  [3/3] Deploying to Vercel..."
cd "$ROOT/frontend"

# Check if vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy (--yes to skip prompts on first deploy)
vercel --prod --yes

echo ""
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  Deployed!                                       │"
echo "  │                                                  │"
echo "  │  Password: barbados2026                          │"
echo "  │  (change in frontend/src/main.jsx → PASS)       │"
echo "  │                                                  │"
echo "  │  Custom domain:                                  │"
echo "  │    vercel domains add barbados.yourdomain.com    │"
echo "  │                                                  │"
echo "  │  Redeploy after changes:                         │"
echo "  │    ./deploy.sh                                   │"
echo "  └─────────────────────────────────────────────────┘"
echo ""
