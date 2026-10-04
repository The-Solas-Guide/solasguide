#!/usr/bin/env bash
# Durable, idempotent setup for The Solas Guide dev environment.
# Runs after the repository is checked out. Installs toolchains and project
# dependencies; per-boot service startup lives in start.sh instead.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

SUPABASE_CLI_VERSION="2.117.0"

echo "==> Ensuring Node $(cat .nvmrc) via nvm"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
if command -v nvm >/dev/null 2>&1; then
  nvm install >/dev/null
  nvm alias default "$(cat .nvmrc)" >/dev/null
  nvm use >/dev/null
fi
node -v

echo "==> Installing Node dependencies (npm ci)"
npm ci

echo "==> Ensuring Docker engine"
if ! command -v docker >/dev/null 2>&1; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq docker.io
fi
docker --version

echo "==> Ensuring Supabase CLI ($SUPABASE_CLI_VERSION)"
if ! command -v supabase >/dev/null 2>&1; then
  arch="$(dpkg --print-architecture)"
  tmp="$(mktemp -d)"
  curl -fsSL "https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/supabase_linux_${arch}.tar.gz" -o "$tmp/supabase.tar.gz"
  tar -xzf "$tmp/supabase.tar.gz" -C "$tmp"
  sudo mv "$tmp/supabase" /usr/local/bin/supabase
  rm -rf "$tmp"
fi
supabase --version

# Best-effort: warm the Supabase Docker image cache so the first boot is quick.
# Never fail the build if the daemon cannot run at image-build time.
echo "==> Warming Supabase image cache (best effort)"
if "$REPO_ROOT/.cursor/start-docker.sh" >/dev/null 2>&1; then
  supabase start >/dev/null 2>&1 || true
  supabase stop --no-backup >/dev/null 2>&1 || true
  echo "Supabase images cached."
else
  echo "Docker daemon unavailable at build time; images will pull on first boot."
fi

echo "==> install.sh complete"
