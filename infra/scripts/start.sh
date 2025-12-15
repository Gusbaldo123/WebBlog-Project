#!/usr/bin/env bash
set -euo pipefail

# Script to copy the base infra .env to repo root, backend, and frontend/src
# Usage: run from anywhere: ./infra/scripts/generate_env.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_ENV="$SCRIPT_DIR/../.env"
ROOT_ENV="$SCRIPT_DIR/../../.env"
BACKEND_ENV="$SCRIPT_DIR/../../backend/.env"
FRONTEND_ENV="$SCRIPT_DIR/../../frontend/src/.env"

# CLI options
FORCE=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    -f|--force)
      FORCE=1; shift ;;
    --no-compose)
      NO_COMPOSE=1; shift ;;
    -h|--help)
      echo "Usage: $0 [--force]";
      echo "  --force  overwrite existing .env files (no backup)";
      exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

# By default run docker compose after generating env files; set NO_COMPOSE=1 to skip
NO_COMPOSE=${NO_COMPOSE:-0}

backup_if_exists() {
  if [ -f "$1" ]; then
    ts=$(date +%Y%m%dT%H%M%S)
    cp "$1" "$1.bak.$ts"
    echo "Backed up $1 -> $1.bak.$ts"
  fi
}

if [ ! -f "$BASE_ENV" ]; then
  echo "Base env not found: $BASE_ENV"
  echo "Create the base .env in infra/.env first or adjust the script."
  exit 1
fi

for dest in "$ROOT_ENV" "$BACKEND_ENV" "$FRONTEND_ENV"; do
  dest_dir="$(dirname "$dest")"
  if [ ! -d "$dest_dir" ]; then
    echo "Creating directory $dest_dir"
    mkdir -p "$dest_dir"
  fi
  if [ -f "$dest" ]; then
    if [ "$FORCE" -eq 1 ]; then
      echo "Overwriting existing $dest (force)"
      cp "$BASE_ENV" "$dest"
      echo "Copied $BASE_ENV -> $dest"
    else
      echo "Skipped $dest (already exists). Use --force to overwrite."
    fi
  else
    cp "$BASE_ENV" "$dest"
    echo "Copied $BASE_ENV -> $dest"
  fi
done

# Fix perms for convenience
if [ -f "$ROOT_ENV" ]; then chmod 600 "$ROOT_ENV" || true; fi
if [ -f "$BACKEND_ENV" ]; then chmod 600 "$BACKEND_ENV" || true; fi
if [ -f "$FRONTEND_ENV" ]; then chmod 600 "$FRONTEND_ENV" || true; fi

echo "All done. Remember to NOT commit .env files to git. Use .env.example instead."

# Run docker compose in infra (build + detached) unless user passed --no-compose
if [ "$NO_COMPOSE" -eq 0 ]; then
  if command -v docker >/dev/null 2>&1; then
    echo "Running 'docker compose up --build -d' in infra/ ..."
    (cd "$SCRIPT_DIR/.." && docker compose up --build -d)
    echo "Docker compose started. Use 'docker compose ps' to check services." 
  else
    echo "docker not found in PATH; skipping docker compose step."
  fi
else
  echo "Skipping docker compose because --no-compose was provided."
fi

