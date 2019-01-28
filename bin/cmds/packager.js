const fs = require("fs-extra");
const archiver = require("archiver");
const checksum = require("./checksum.js");

exports.command = ['package', "pack"];
exports.desc = 'Package the addon into a zip';
exports.builder = (yargs) => {
    yargs
        .option('zipfolder', { alias: 'z', default: './dist', describe: 'The folder to create the package in' })
        .option('checksum', { alias: 'c', default: false, describe: 'Apply checksum creation for zip file' })
        .demandOption(['dist', 'zipfolder']);
};
exports.handler = async function (argv) {

    console.log('[PACKAGING] Start packaging');
    await exports.zipPackage(argv);      
    if (argv.checksum) {
        await createChecksumOfZipfile(argv);
    } 
    console.log('[PACKAGING] Finished');
}

exports.zipPackage = (config) => {
    
	return new Promise((resolve, reject) => {

        var zipFileName = config.packagename + '-' + config.version + '.zip';
        var zipDest = config.zipfolder + '/' + zipFileName;
        
        config.currentPackageFilename = zipFileName;

        if (config.verbose)
            console.log('[PACKAGING] Creating package ' + zipFileName);

        var output = fs.createWriteStream(zipDest);
        var archive = archiver('zip');
        
        output.on('close', function () {
            if (config.verbose)
                console.log('[PACKAGING] ' + archive.pointer() + ' total bytes');
                console.log('[PACKAGING] Addon has been packaged');

            resolve();
        });
        
        archive.on('error', function(err){
            throw err;
        });
        
        archive.pipe(output);
        archive.directory(config.dist + '/' + config.packagename, config.packagename);
        archive.finalize();
    });
};

const createChecksumOfZipfile = (config) => {

    var zipDest = config.zipfolder + '/' + config.currentPackageFilename;
    return checksum.createChecksumFile(zipDest);
}
