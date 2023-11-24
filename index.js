const handlebars = require("handlebars"),
  fs = require("fs"),
  pdf = require("html-pdf");

const puppeteer = require("puppeteer");

const basePath = `file://${__dirname}/templates/CV-Template/`,
  fileOut = "output/Roberto_Serra_CV.pdf",
  templateDir = "templates/CV-Template/",
  templateFile = "index.hbs",
  dataFile = "info.json",
  assets = ["square.png","circle.png", "style.css"];

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
function compileTemplate(data) {
  return new Promise((resolve, reject) => {
    fs.readFile(templateDir + templateFile, "utf-8", (error, source) => {
      if (error) reject(error);

      const template = handlebars.compile(source);
      resolve(template(data));
    });
  });
}

async function pdfOutput(html) {
  const browser = await puppeteer.launch({ headless: "new" });

  // Create a new page
  const page = await browser.newPage();

  // Website URL to export as pdf
  const website_url = "file:///Users/rserra/Develop/resume/output/index.html";
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
    const data = await readData(dataFile);
    console.log("[+] Compiling the template");
    const html = await compileTemplate(data);

    htmlOutput(html);
    console.log("[+] Copy assets");
    await copyAllAssets(assets);
    // return;
    console.log("[+] Generating PDF");
    await pdfOutput(html);
    console.log(`[+] Done `);
  } catch (e) {
    console.log(e);
  }
}

run();
