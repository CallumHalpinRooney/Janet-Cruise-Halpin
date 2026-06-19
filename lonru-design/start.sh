#!/usr/bin/env bash
#
# Lonrú Design — one-step local launcher.
# Installs dependencies (first run only) and starts the dev server.
#
# Usage:
#   ./start.sh
# then open http://localhost:3000
#
set -e

# Move to the directory this script lives in, so it works from anywhere.
cd "$(dirname "$0")"

echo "→ Lonrú Design — starting up..."

# Check Node is available.
if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js is not installed. Install it from https://nodejs.org (v18.18+ or v20+), then re-run ./start.sh"
  exit 1
fi

# Install dependencies only if they're missing.
if [ ! -d node_modules ]; then
  echo "→ Installing dependencies (first run, ~1 min)..."
  npm install
else
  echo "→ Dependencies already installed, skipping."
fi

echo ""
echo "→ Starting dev server. When you see 'Ready', open:"
echo ""
echo "    http://localhost:3000"
echo ""
echo "  (Press Ctrl+C to stop.)"
echo ""

npm run dev
