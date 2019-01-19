const fs = require("fs-extra");
const archiver = require("archiver");

exports.command = ['package', "pack"];
exports.desc = 'Package the addon into a zip';
exports.builder = (yargs) => {
    yargs
        .option('repositoryfolder', { alias: 'r', default: './dist', describe: 'The repository folder for the packages' })
        .demandOption(['dist', 'repositoryfolder']);
};
exports.handler = async function (argv) {

    console.log('[PACKAGING] Start packaging');
    await zipPackage(argv);            
    console.log('[PACKAGING] Finished');
}

const zipPackage = (config) => {
    
	return new Promise((resolve, reject) => {

        var zipFileName = config.packagename + '-' + config.version + '.zip';
        var zipDest = config.repositoryfolder + '/' + zipFileName;
        
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
        archive.directory(config.dist + '/' + config.packagename, false);
        archive.finalize();
    });
};
