const path = require('path');
const dom = require('xmldom').DOMParser;
const globby = require("globby");
const fs = require("fs-extra");
const packager = require("./packager.js");
const checksum = require("./checksum.js");

exports.command = 'repository';
exports.desc = 'Package addon and update it in your repository folder, as well as updating the whole repository';
exports.builder = (yargs) => {
    yargs
    .option('repositoryfolder', { alias: 'r', default: './dist', describe: 'The folder with your kodi repository' })
    .option('zipfolder', { alias: 'z', default: './dist', describe: 'The folder to create the package in' })
    .demandOption(['dist', 'repositoryfolder']);
};

exports.handler = async function (argv) {

    console.log('[REPOSITORY] Start updating repository');
    if (argv.zipfolder.length == 0) {
        argv.zipfolder = config.dist;
    }
    await packager.zipPackage(argv);  
    await copyPackageToRepository(argv);
    await copyAssetsToRepository(argv);
    await copyAddonXmlToRepository(argv);
    await updateHtmlPageForAddonDirectory(argv);
    await updateAddonsXmlInRepository(argv);
    await updateHtmlPageForAddonsRootDirectory(argv);
    console.log('[REPOSITORY] Finished');
};

const copyPackageToRepository = (config) => {
    
    var zipOrigin = config.zipfolder + config.currentPackageFilename;
    var zipDest =  config.repositoryfolder + config.packagename + path.sep + config.currentPackageFilename;

    if (config.verbose) {
        console.log('[REPOSITORY] Copying package '+ zipOrigin + ' to ' + zipDest);
    }
    return fs.copy(zipOrigin, zipDest).then(() => {
        return checksum.createChecksumFile(zipDest);
    });
};

const copyAssetsToRepository = (config) => {

	return new Promise((resolve, reject) => {
        var doc = getAddonXmlDocWithProvider(config);    
        var iconNodes = doc.getElementsByTagName("icon");
        var fanartNodes = doc.getElementsByTagName("fanart");
        var screenshotNodes = doc.getElementsByTagName("screenshot");

        var dest =  config.repositoryfolder + config.packagename + path.sep;

        if (config.verbose)
            console.log('[REPOSITORY] Copying assets');
        
        if (iconNodes != null && iconNodes.length > 0) {
            var node = iconNodes.item(0);
            var relativePath = node.textContent;
            
            var destPath = dest + relativePath;
            var orgPath = config.dist + config.packagename + path.sep + relativePath;

            fs.ensureDirSync(path.dirname(destPath));
            fs.copyFileSync(orgPath, destPath);
            if (config.verbose)
                console.log(`[REPOSITORY] Copied asset icon: ${orgPath} to ${destPath}`);
        }
        
        if (fanartNodes != null && fanartNodes.length > 0) {
            var node = fanartNodes.item(0);
            var relativePath = node.textContent;
            
            var destPath = dest + relativePath;
            var orgPath = config.dist + config.packagename + path.sep + relativePath;

            fs.ensureDirSync(path.dirname(destPath));
            fs.copyFileSync(orgPath, destPath);
            if (config.verbose)
                console.log(`[REPOSITORY] Copied asset fanart: ${orgPath} to ${destPath}`);
        }
        
        if (screenshotNodes != null && screenshotNodes.length > 0) {
            
            for (var i = 0; i<screenshotNodes.length; i++) {
                var node = screenshotNodes.item(i);
                var relativePath = node.textContent;
                
                var destPath = dest + relativePath;
                var orgPath = config.dist + config.packagename + path.sep + relativePath;

                fs.ensureDirSync(path.dirname(destPath));
                fs.copyFileSync(orgPath, destPath);
                if (config.verbose)
                    console.log(`[REPOSITORY] Copied asset screenshot: ${orgPath} to ${destPath}`);
            }
        }

        resolve();
    });
}

const copyAddonXmlToRepository = (config) => {

    var srcDoc = getAddonXmlDocWithProvider(config);
    var dest =  config.repositoryfolder + config.packagename + path.sep + 'addon.xml';

    if (config.verbose) {
        console.log('[REPOSITORY] Copying addon xml to ' + dest);
    }
    
    return fs.writeFile(dest, srcDoc);
}

const updateAddonsXmlInRepository = (config) => {

    var addonsFilePath = config.repositoryfolder + 'addons.xml';
    var addonsFileXml = fs.readFileSync(addonsFilePath, 'utf8');
    var doc = new dom().parseFromString(addonsFileXml)
    var addonNodes = doc.getElementsByTagName("addon")
        
    if (config.verbose)
        console.log('[REPOSITORY] Updating addons xml');
    
    var newAddonNodeDoc = getAddonXmlDocWithProvider(config);
    var newAddonNode = newAddonNodeDoc.getElementsByTagName("addon")[0];

    var found = false;
    for (var i = 0; i<addonNodes.length; i++) {
        var addonNode = addonNodes.item(i);

        if (addonNode.getAttribute('id') === config.packagename) {
            let parent = addonNode.parentNode;
            
            parent.insertBefore(newAddonNode, addonNode);
            parent.removeChild(addonNode);
            
            if (config.verbose)
                console.log('[REPOSITORY] Updated addons xml by replacing element with id ' + config.packagename);

            found = true;
            break;
        }
    }

    if (!found) {
        var addonsNode = doc.getElementsByTagName("addons")[0];
        addonsNode.appendChild(newAddonNode);

        if (config.verbose)
            console.log('[REPOSITORY] Updated addons xml by adding new element with id ' + config.packagename);
    }

    return fs.writeFile(addonsFilePath, doc).then(() => {
        return checksum.createChecksumFile(addonsFilePath);
    });
}

const getAddonXmlDocWithProvider = (config) => {

    var src = config.dist + config.packagename + path.sep + 'addon.xml';
    var addonFileXml = fs.readFileSync(src, 'utf8');
    var doc = new dom().parseFromString(addonFileXml)

    return doc;
}

const updateHtmlPageForAddonsRootDirectory = (config) => {

    var addonsFilePath = config.repositoryfolder + 'addons.xml';
    var addonsFileXml = fs.readFileSync(addonsFilePath, 'utf8');
    var doc = new dom().parseFromString(addonsFileXml)
    var addonNodes = doc.getElementsByTagName("addon")
        
    if (config.verbose)
        console.log('[REPOSITORY] Creating HTML file with root directory listing');
    
    var html = []
    html.push('<html>','<body>');
    html.push('<h1>Repository directory listing</h1>');
    html.push('<hr/>');
    html.push('<pre>');
    
    for (var i = 0; i<addonNodes.length; i++) {
        var addonNode = addonNodes.item(i);
        var addonId = addonNode.getAttribute("id");
        
        if (config.verbose)
            console.log(`[REPOSITORY] Adding link to ${addonId}`);

        html.push(`<a href="./${addonId}/index.html">${addonId}</a>`);
    }
    html.push('</pre>','</body>','</html>');

    var htmlFile = config.repositoryfolder + 'index.html';
    return fs.writeFile(htmlFile, html.join('\n'));
}

const updateHtmlPageForAddonDirectory = (config) => {

    var folderPath =  config.repositoryfolder + config.packagename + path.sep;
    var dirName = folderPath.split(/\\|\//).filter(p => p).pop();

    if (config.verbose)
        console.log(`[REPOSITORY] Creating HTML file for folder: ${folderPath}`);

    const filesInFolder = globby.sync([
        '*.zip',
        '*.zip.md5'
    ], { cwd: folderPath, gitignore: true });

    var html = []
    html.push('<html>','<body>','<h1>');
    html.push(`Directory listing for ${dirName}`);
    html.push('</h1>', '<hr/>');
    html.push('<pre>','<a href="../index.html">..</a>');

    for(var i in filesInFolder) {
        var fileName = filesInFolder[i];
        html.push(`<a href="${fileName}">${fileName}</a>`);
    }
    html.push('</pre>','</body>','</html>');

    var htmlFile = folderPath + 'index.html';
    return fs.writeFile(htmlFile, html.join('\n'));
}