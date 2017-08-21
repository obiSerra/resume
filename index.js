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

const readData = new RSVP.Promise((resolve, reject) => {
    fs.readFile(dataFile, 'utf8', function (error, data) {
        if (error) reject(error);
        resolve(JSON.parse(data));
    });
});

console.log(basePath)

readData
    .then(data => {
        console.log('[+] Reading template');
        return new RSVP.Promise((resolve, reject) => {
            fs.readFile(templateDir + templateFile, 'utf-8', function(error, source) {
                if (error) reject(error);
                const  template = handlebars.compile(source);
                resolve(template(data));
            });
        });
    })
    .then(function(html) {
        const options = { format: 'A4',
                          base: basePath,
                          timeout: 30000
                        };
        htmlOutput(html);


        assets.forEach(ast => fs.createReadStream(templateDir + ast).pipe(fs.createWriteStream('output/' + ast)));

        console.log('[+] Generating PDF');
        return new RSVP.Promise((resolve, reject) => {
            pdf.create(html, options).toFile(fileOut, (error, res) => {
                if (error) reject(error);
                resolve(res);
            });
        });
    })
    .then(res => {
        console.log(`[+] Done ${res.filename}`);
    })
    .catch(error => console.log(error));
