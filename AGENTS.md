# Resume Generator - Agent Instructions

## Project Overview
CV/resume generator that compiles Handlebars templates with Tailwind CSS and outputs PDF via Puppeteer. Runs entirely in Docker - no local Node.js installation required.

## Development Commands

### Prerequisites
- Docker installed and running
- No local Node.js, npm, or Puppeteer installation required

### Generate Resume

**Basic usage:**
```bash
./docker-generate.sh
```

**With options:**
```bash
# Exclude side projects
./docker-generate.sh --no-side-projects

# Exclude notable projects
./docker-generate.sh --no-notable-projects

# Generate single-page resume (exclude both)
./docker-generate.sh --no-side-projects --no-notable-projects

# Custom output filename
./docker-generate.sh --output-name "Senior_Engineer_CV.pdf"

# Combine flags
./docker-generate.sh --output-name "Short_Resume" --no-side-projects --no-notable-projects

# Display help
./docker-generate.sh --help
```

This script will:
1. Build the Docker image (cached after first run)
2. Compile Tailwind CSS inside container
3. Generate PDF from `info.json`
4. Output to `output/` directory

**Available Flags:**
- `--no-side-projects` - Excludes "Side Projects" section from page 2
- `--no-notable-projects` - Excludes "Notable Projects" section from page 2
- `--output-name <filename>` - Custom output filename (default: Roberto_Serra_CV.pdf)
- `--help`, `-h` - Display usage information
- Both `--no-*` flags together - Generates single-page resume (excludes entire page 2)

**Notes:**
- Output files always saved to `output/` directory
- `.pdf` extension added automatically if not provided
- File permissions preserved (owned by current user, not root)

### Update Resume Content
1. Edit `info.json` with your updated information
2. Run `./docker-generate.sh` to regenerate PDF

### Manual Docker Commands (if needed)
```bash
# Build image
docker build -t resume-generator .

# Run generation (default)
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -v "$(pwd)/info.json:/app/info.json:ro" \
  -v "$(pwd)/output:/app/output" \
  resume-generator

# Run with flags
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -v "$(pwd)/info.json:/app/info.json:ro" \
  -v "$(pwd)/output:/app/output" \
  resume-generator --no-side-projects --output-name "Custom_CV.pdf"
```

**Note:** The `--user` flag ensures generated files are owned by you, not root.

## Architecture

### Data flow
1. `info.json` contains all resume content
2. Handlebars compiles `templates/CV-Template/index.hbs` with data
3. Outputs HTML to `output/index.html`
4. Puppeteer converts HTML to `output/Roberto_Serra_CV.pdf`

### Key files
- `info.json` - All resume data (name, jobs, skills, etc). Edit this, not templates.
- `index.js` - Main generation script with Puppeteer PDF conversion and argument parsing
- `Dockerfile` - Docker image configuration with Node.js and Chrome
- `entrypoint.sh` - Docker entrypoint script for argument handling
- `docker-generate.sh` - Wrapper script for Docker build and run
- `templates/CV-Template/index.hbs` - Handlebars template with conditional rendering
- `templates/CV-Template/raw_style.scss` - Tailwind input styles
- `templates/CV-Template/style.css` - Generated Tailwind output (do not edit directly)
- `output/Roberto_Serra_CV.pdf` - Final generated PDF (default name)

### Template assets
These files are copied to `output/` during generation: `square.png`, `circle.png`, `style.css`

## Modification Guidelines

**To update resume content:** Edit `info.json`

**To change layout/design:** Edit `templates/CV-Template/index.hbs` and `raw_style.scss`

**To change PDF settings:** Edit Puppeteer config in `index.js` (margin, format, etc)

**Custom Handlebars helper:** See `ifThird` and `and` helpers in `index.js` as examples

## Docker Implementation Details

### Why Docker?
- Eliminates local dependency management (Node.js, Chrome, Puppeteer)
- Ensures reproducible builds across all systems
- Portable - works on Linux, macOS, Windows with Docker

### Image Details
- Base: `node:18-slim`
- Includes system Chromium for Puppeteer headless browser
- All project dependencies installed via yarn
- Output directory mounted as volume for PDF extraction

## Constraints

- NEVER use icons, emoticons, or decorative Unicode in code or documentation
- NEVER include AI attribution, model names, or Co-Authored-By lines in git commit messages
- Do not commit generated files (`output/*.html`, `output/*.css`, `output/*.jpg`) - these are gitignored
- Docker required for generation (replaces local Node.js requirement)
