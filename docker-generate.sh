#!/usr/bin/env bash

# Build Docker image
echo "[+] Building Docker image..."
docker build -t resume-generator .

# Run container with proper permissions
echo "[+] Generating resume..."
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -v "$(pwd)/info.json:/app/info.json:ro" \
  -v "$(pwd)/output:/app/output" \
  resume-generator

echo "[+] PDF generated at: output/Roberto_Serra_CV.pdf"
