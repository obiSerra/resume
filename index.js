const handlebars = require('handlebars'),
      fs = require('fs'),
      pdf = require('html-pdf'),
      RSVP = require('rsvp');

const basePath = `file://${__dirname}/templates/CV-Template/`,
      fileOut = 'output/Roberto_Serra_CV.pdf',
      templateDir = 'templates/CV-Template/',
      templateFile = 'index.html',
      dataFile = 'info.json',
      assets = ['headshot.jpg', 'style.css'];


const htmlOutput = (html) => {
    var fileName = 'output/index.html';
    var stream = fs.createWriteStream(fileName);

    stream.once('open', function(fd) {
        stream.end(html);
    });
};

async function readData () {
    return new RSVP.Promise((resolve, reject) => {
        fs.readFile(dataFile, 'utf8', function (error, data) {
            if (error) reject(error);
            resolve(JSON.parse(data));
        });
    });
}

async function readTemplate (data) {
    console.log('[+] Parsing template');
    return new RSVP.Promise((resolve, reject) => {
        fs.readFile(templateDir + templateFile, 'utf-8', function(error, source) {
            if (error) reject(error);
            const  template = handlebars.compile(source);
            resolve(template(data));
        });
    });
}

async function generateOutput (html) {
    const options = { format: 'A4', base: basePath, timeout: 30000 };

    htmlOutput(html);
   
    assets.forEach(ast => fs.createReadStream(templateDir + ast).pipe(fs.createWriteStream('output/' + ast)));
    
    console.log('[+] Generating PDF');
    return new RSVP.Promise((resolve, reject) => {
        pdf.create(html, options).toFile(fileOut, (error, res) => {
            if (error) reject(error);
            resolve(res);
        });
    });    
}

async function parseData () {
    try {
        const data = await readData();
        const html = await readTemplate(data);
        const res = await generateOutput(html);

        console.log(`[+] Done ${res.filename}`);
    } catch (e) {
        console.log(e);
    }
}


parseData();
