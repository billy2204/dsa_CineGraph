#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="BE/out"
CONFIG_FILE="BE/config.properties"
DEFAULT_BE_PORT=8080
FE_PORTS=(5173 5174 4173)

kill_port() {
	local port="$1"
	if [[ -z "$port" ]]; then
		return
	fi
	if ! command -v lsof >/dev/null 2>&1; then
		echo "[CineGraph] lsof not found; skip killing port $port"
		return
	fi
	local pids
	pids=$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)
	if [[ -n "$pids" ]]; then
		echo "[CineGraph] Killing process on port $port (PID: $pids)"
		kill $pids 2>/dev/null || true
		local still
		still=$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)
		if [[ -n "$still" ]]; then
			kill -9 $still 2>/dev/null || true
		fi
	fi
}

read_be_port() {
	if [[ -f "$CONFIG_FILE" ]]; then
		local port
		port=$(awk -F= '/^server\.port=/{print $2}' "$CONFIG_FILE" | tail -n1 | tr -d '[:space:]')
		if [[ -n "$port" ]]; then
			echo "$port"
			return
		fi
	fi
	echo "$DEFAULT_BE_PORT"
}

echo "[CineGraph] Stopping old FE/BE processes..."
BE_PORT=$(read_be_port)
kill_port "$BE_PORT"
for port in "${FE_PORTS[@]}"; do
	kill_port "$port"
done

echo "[CineGraph] Cleaning build output..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "[CineGraph] Compiling Java sources..."
javac -d "$OUT_DIR" $(find BE/src -name '*.java')

echo "[CineGraph] Starting API server..."
java -cp "$OUT_DIR" Application "$@"
