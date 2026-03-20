#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  YOTEL + YOTELPAD Barbados — Masterplan Explorer
#  Single command to run the full app
# ═══════════════════════════════════════════════════════════
#
#  Usage:
#    chmod +x run.sh
#    ./run.sh
#
#  What it does:
#    1. Checks Python 3 and Node.js are installed
#    2. Runs the backend engine (generates 30 options → JSON)
#    3. Installs frontend dependencies (npm install)
#    4. Starts the Vite dev server (opens browser at localhost:3000)
#
# ═══════════════════════════════════════════════════════════

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
EXPORTS="$ROOT/exports"
FRONTEND_DATA="$FRONTEND/src/data"

echo ""
echo "  ╔═══════════════════════════════════════════════════╗"
echo "  ║  YOTEL + YOTELPAD Barbados                       ║"
echo "  ║  Masterplan Explorer                              ║"
echo "  ╚═══════════════════════════════════════════════════╝"
echo ""

# ─── CHECK DEPENDENCIES ─────────────────────────────────────
echo "  [1/4] Checking dependencies..."

if ! command -v python3 &> /dev/null; then
    echo "  ✗ Python 3 not found. Install from https://python.org"
    exit 1
fi
PY_VER=$(python3 --version 2>&1)
echo "        ✓ $PY_VER"

if ! command -v node &> /dev/null; then
    echo "  ✗ Node.js not found. Install from https://nodejs.org"
    exit 1
fi
NODE_VER=$(node --version 2>&1)
echo "        ✓ Node.js $NODE_VER"

if ! command -v npm &> /dev/null; then
    echo "  ✗ npm not found. Install Node.js from https://nodejs.org"
    exit 1
fi
NPM_VER=$(npm --version 2>&1)
echo "        ✓ npm $NPM_VER"
echo ""

# ─── RUN BACKEND ENGINE ─────────────────────────────────────
echo "  [2/4] Running options engine..."

mkdir -p "$EXPORTS"
mkdir -p "$FRONTEND_DATA"

cd "$ROOT"
python3 backend/run_engine.py --max 30
echo ""

# ─── INSTALL FRONTEND ────────────────────────────────────────
echo "  [3/4] Installing frontend dependencies..."

cd "$FRONTEND"

if [ ! -d "node_modules" ]; then
    npm install --silent 2>&1 | tail -1
    echo "        ✓ Dependencies installed"
else
    echo "        ✓ Dependencies already installed"
fi
echo ""

# ─── LAUNCH ──────────────────────────────────────────────────
echo "  [4/4] Starting viewer..."
echo ""
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │  App running at: http://localhost:3000           │"
echo "  │                                                  │"
echo "  │  • Left panel:   Option cards + controls         │"
echo "  │  • Centre:       3D massing viewer               │"
echo "  │  • Right panel:  Metrics + cost + revenue         │"
echo "  │                                                  │"
echo "  │  Press Ctrl+C to stop                            │"
echo "  └─────────────────────────────────────────────────┘"
echo ""

npx vite --port 3000 --open
