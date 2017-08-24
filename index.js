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
    return new Promise ((resolve, reject) => {
        const fileName = 'output/index.html';
        const stream = fs.createWriteStream(fileName);

        stream.once('open', () => stream.end(html));
        stream.on('close', () => resolve());
    });   
};

function copyAsset (ast) {
    return new Promise((resolve, reject) => {
        const rStream = fs.createReadStream(templateDir + ast);
        const wStream = fs.createWriteStream('output/' + ast);
        
        rStream.on('error', error => reject(error));
        wStream.on('error', error => reject(error));

        wStream.on('close', () => resolve());

        rStream.pipe(wStream);

    });  
}

function copyAllAssets (asts) {
    return Promise.all(assets.map(copyAsset));
}

function readData () {
    return new Promise((resolve, reject) => {
        fs.readFile(dataFile, 'utf8', (error, data) => {
            if (error) reject(error);
            resolve(JSON.parse(data));
        });
    });
}

function compileTemplate (data) {
    return new Promise((resolve, reject) => {
        fs.readFile(templateDir + templateFile, 'utf-8', (error, source) => {
            if (error) reject(error);
            const  template = handlebars.compile(source);
            resolve(template(data));
        });
    });
}

function pdfOutput (html) {
    const options = { format: 'A4', base: basePath, timeout: 30000 };
    return new Promise((resolve, reject) => {
        pdf.create(html, options).toFile(fileOut, (error, res) => {
            if (error) reject(error);
            resolve(res);
        });
    });    
}

async function run () {
    try {
        
        const data = await readData();
        console.log('[+] Compiling the template');
        const html = await compileTemplate(data);

        htmlOutput(html);
        console.log('[+] Copy assets');         
        await copyAllAssets(assets);
        console.log('[+] Generating PDF');
//        const res = await pdfOutput(html);

//        console.log(`[+] Done ${res.filename}`);
    } catch (e) {
        console.log(e);
    }
}


run();
