const semver = require("semver");
const bump = require('bump-regex');
const fs = require("fs-extra");
const dom = require('xmldom').DOMParser;

exports.command = ['versioning'];
exports.desc = 'Get and set version for the addon';
exports.builder = (yargs) => {
    yargs
        .option('semver', { 
            alias: 'sv',
            default: '', 
            describe: 'Optional semver type to apply. Empty for no upgrade', 
            group: 'Defaults', 
            choices: ['major', 'minor', 'patch', 'prerelease', '']      
        })
        .demandOption('src');
}
exports.handler = async function (argv) {

    console.log('[VERSIONING] Start versioning');         
    await setVersion(argv);
    console.log('[VERSIONING] Finished');
}

const setVersion = (config) => {
    
    if (config.verbose)
        console.log("[VERSIONING] Processing version number");
    
	return new Promise((resolve, reject) => {
        
        // patch, minor, major, prepatch, preminor, premajor, prerelease
        if (config.semver !== '' && config.semver.length > 0) {
            config.version = semver.inc(config.version, config.semver);    
        }
        
        if (config.verbose)
            console.log('[VERSIONING] Addon version: ' + config.version);

        Promise.all([
            updateVersionInPackageFile(config),
            updateVersionInAddonXml(config)
        ]).then(() => {
            resolve();
        });
    });
};

const updateVersionInPackageFile = (config) => {
    
    return new Promise((resolve, reject) => {
        
        if (config.semver === '' || config.semver.length == 0) {
            resolve();
            return;
        }

        var pkg = fs.readFileSync('./package.json', 'utf8');
        bump({
            version: config.version,
            str: pkg
        }, (error, out) => {
            if (error != null) {
                reject();
                return;
            }
            
            fs.writeFileSync('./package.json', out.str);
            resolve();
        });
    });
};

const updateVersionInAddonXml = (config) => {
    
    return new Promise((resolve, reject) => {
        
        var addonFilePath = config.src + 'addon.xml';
        var addonFileXml = fs.readFileSync(addonFilePath, 'utf8');
        var doc = new dom().parseFromString(addonFileXml)
        var mainNode = doc.getElementsByTagName("addon")[0]
        
        mainNode.setAttribute('version', config.version);

        fs.writeFileSync(addonFilePath, doc);
        resolve();
    });
};
