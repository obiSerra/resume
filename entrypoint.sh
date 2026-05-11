#!/usr/bin/env bash
set -e

# Compile Tailwind CSS
npx tailwindcss -i ./templates/CV-Template/raw_style.scss -o ./templates/CV-Template/style.css

# Run Node.js with all passed arguments
node index.js "$@"
