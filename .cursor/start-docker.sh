#!/usr/bin/env bash
# Idempotently bring up the Docker daemon that the local Supabase stack needs.
# Safe to run repeatedly (install-time warm-up and every boot).
set -euo pipefail

# Docker 29 defaults to the nftables firewall backend, which does not wire up
# bridge forwarding in this sandbox. Pin the iptables backend instead.
sudo mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ]; then
  echo '{"firewall-backend":"iptables"}' | sudo tee /etc/docker/daemon.json >/dev/null
fi

if ! sudo docker info >/dev/null 2>&1; then
  sudo rm -f /var/log/dockerd.log
  sudo bash -c 'nohup dockerd >/var/log/dockerd.log 2>&1 &'
  for _ in $(seq 1 30); do
    if sudo docker info >/dev/null 2>&1; then break; fi
    sleep 1
  done
fi

# The sandbox ships a stale *legacy* iptables ruleset whose FORWARD policy is
# DROP and whose Docker rules only cover docker0. Traffic on Docker's custom
# bridge networks (which Supabase relies on for container-to-container comms)
# hits that legacy chain and is silently dropped, even though Docker's own
# nft-backed rules are correct. Relax the legacy default policy so bridge
# traffic is delivered.
if sudo iptables-legacy -S FORWARD 2>/dev/null | grep -q -- '-P FORWARD DROP'; then
  sudo iptables-legacy -P FORWARD ACCEPT || true
fi

# Let the workspace user talk to the daemon without sudo.
sudo chmod 666 /var/run/docker.sock || true

sudo docker info >/dev/null 2>&1
echo "Docker daemon is ready."
