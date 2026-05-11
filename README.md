# Resume Generator

A Docker-based CV/resume generator that compiles Handlebars templates with Tailwind CSS and outputs PDF via Puppeteer.

## Prerequisites

- Docker installed and running
- No local Node.js, npm, or Puppeteer installation required

## Usage

### Generate Full Resume (Default)

```bash
./docker-generate.sh
```

Generates a 2-page PDF with all sections included at `output/Roberto_Serra_CV.pdf`.

### Generate Resume with Options

```bash
# Exclude side projects section
./docker-generate.sh --no-side-projects

# Exclude notable projects section
./docker-generate.sh --no-notable-projects

# Generate single-page resume (exclude both sections)
./docker-generate.sh --no-side-projects --no-notable-projects

# Custom output filename
./docker-generate.sh --output-name "John_Doe_Resume.pdf"

# Custom filename without .pdf extension (will be added automatically)
./docker-generate.sh --output-name "Short_CV"

# Combine multiple options
./docker-generate.sh --output-name "Jane_Smith_1Page" --no-side-projects --no-notable-projects

# Display help
./docker-generate.sh --help
```

### Available Flags

- `--no-side-projects` - Excludes "Side Projects" section from page 2
- `--no-notable-projects` - Excludes "Notable Projects" section from page 2
- `--output-name <filename>` - Specify custom output filename (default: `Roberto_Serra_CV.pdf`)
- `--help`, `-h` - Display usage information

**Notes:**
- When both `--no-side-projects` and `--no-notable-projects` are specified, the entire second page is omitted, generating a single-page resume
- Output filename will automatically get `.pdf` extension if not provided
- Output files are always saved to the `output/` directory
- File permissions are preserved (generated files owned by current user, not root)

## Update Resume Content

1. Edit `info.json` with your information
2. Run `./docker-generate.sh` to regenerate the PDF

## Output

Generated PDF: `output/Roberto_Serra_CV.pdf` (or custom name if specified)

## Project Structure

- `info.json` - Resume data (name, jobs, skills, etc.)
- `index.js` - Main generation script
- `Dockerfile` - Docker image configuration
- `entrypoint.sh` - Docker entrypoint for argument handling
- `docker-generate.sh` - Build and run wrapper script
- `templates/CV-Template/` - Handlebars template and styles
- `output/` - Generated PDF and assets

## How It Works

1. Docker builds an image with Node.js 18 and Chromium
2. Tailwind CSS compiles styles from `templates/CV-Template/raw_style.scss`
3. Handlebars compiles the template with data from `info.json`
4. Puppeteer converts the HTML to PDF using headless Chromium
5. Output is saved to the `output/` directory

## Docker Details

- **Base Image**: `node:18-slim`
- **Browser**: System Chromium (no download required)
- **Isolation**: Complete - no local dependencies needed
- **Reproducibility**: Same output across all systems
