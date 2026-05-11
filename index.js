const handlebars = require("handlebars"),
  fs = require("fs");

const puppeteer = require("puppeteer");

const basePath = `file://${__dirname}/templates/CV-Template/`,
  defaultOutputFile = "output/Roberto_Serra_CV.pdf",
  templateDir = "templates/CV-Template/",
  templateFile = "index.hbs",
  dataFile = "info.json",
  assets = ["square.png","circle.png", "style.css"];

// Parse command-line arguments
const args = process.argv.slice(2);
const flags = {
  noSideProjects: args.includes('--no-side-projects'),
  noNotableProjects: args.includes('--no-notable-projects'),
  showHelp: args.includes('--help') || args.includes('-h'),
  outputName: null
};

// Extract output name if provided
const outputNameIndex = args.findIndex(arg => arg === '--output-name');
if (outputNameIndex !== -1 && args[outputNameIndex + 1]) {
  let outputName = args[outputNameIndex + 1];
  
  // Basic filename validation
  // Prevent path traversal
  if (outputName.includes('/') || outputName.includes('\\')) {
    console.error('Error: Output name cannot contain path separators (/ or \\)');
    process.exit(1);
  }
  
  // Prevent problematic characters
  if (outputName.includes('..')) {
    console.error('Error: Output name cannot contain ".."');
    process.exit(1);
  }
  
  // Length validation
  if (outputName.length > 200) {
    console.error('Error: Output name too long (max 200 characters)');
    process.exit(1);
  }
  
  // Ensure .pdf extension
  if (!outputName.endsWith('.pdf')) {
    outputName += '.pdf';
  }
  
  flags.outputName = outputName;
}

// Display help if requested
if (flags.showHelp) {
  console.log(`
Usage: node index.js [OPTIONS]

Generate a PDF resume from info.json template.

Options:
  --no-side-projects          Exclude "Side Projects" section from page 2
  --no-notable-projects       Exclude "Notable Projects" section from page 2
  --output-name <filename>    Specify output filename (default: Roberto_Serra_CV.pdf)
  --help, -h                  Display this help message

Examples:
  node index.js                                          # Generate full 2-page resume
  node index.js --no-side-projects                       # Exclude side projects
  node index.js --no-notable-projects                    # Exclude notable projects
  node index.js --no-side-projects --no-notable-projects # Generate single-page resume
  node index.js --output-name "John_Doe_Resume.pdf"      # Custom output filename
  node index.js --output-name "Short_CV" --no-side-projects --no-notable-projects
  `);
  process.exit(0);
}

const htmlOutput = html => {
  return new Promise((resolve, reject) => {
    const fileName = "output/index.html";
    const stream = fs.createWriteStream(fileName);

    stream.once("open", () => stream.end(html));
    stream.on("close", () => resolve());
  });
};

function copyAsset(ast) {
  return new Promise((resolve, reject) => {
    const rStream = fs.createReadStream(templateDir + ast);
    const wStream = fs.createWriteStream("output/" + ast);

    rStream.on("error", error => reject(error));
    wStream.on("error", error => reject(error));
    wStream.on("close", () => resolve());
    rStream.pipe(wStream);
  });
}

function copyAllAssets(asts) {
  return Promise.all(assets.map(copyAsset));
}

function readData(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (error, data) => {
      if (error) reject(error);
      resolve(JSON.parse(data));
    });
  });
}

handlebars.registerHelper("ifThird", function (index, options) {
  if (index === 2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper("and", function (a, b) {
  return a && b;
});

function compileTemplate(data, flags) {
  return new Promise((resolve, reject) => {
    fs.readFile(templateDir + templateFile, "utf-8", (error, source) => {
      if (error) reject(error);

      const template = handlebars.compile(source);
      const templateData = {
        ...data,
        flags: flags
      };
      resolve(template(templateData));
    });
  });
}

async function pdfOutput(html, fileOut) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Create a new page
  const page = await browser.newPage();

  // Website URL to export as pdf
  const website_url = `file://${__dirname}/output/index.html`;
  await page.goto(website_url, { waitUntil: "networkidle0" });
  await page.emulateMediaType("screen");
  const pdf = await page.pdf({
    path: fileOut,
    margin: { top: "10px", right: "50px", bottom: "50px", left: "10px" },
    printBackground: true,
    format: "A4",
  });

  await browser.close();
}

async function run() {
  try {
    // Determine output filename
    const fileOut = flags.outputName 
      ? `output/${flags.outputName}` 
      : defaultOutputFile;
    
    const data = await readData(dataFile);
    console.log("[+] Compiling the template");
    const html = await compileTemplate(data, flags);

    htmlOutput(html);
    console.log("[+] Copy assets");
    await copyAllAssets(assets);
    console.log("[+] Generating PDF");
    await pdfOutput(html, fileOut);
    console.log(`[+] Done - PDF saved to: ${fileOut}`);
  } catch (e) {
    console.log(e);
  }
}

run();
