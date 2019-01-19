const globby = require("globby");
const fs = require("fs-extra");

exports.command = ['build'];
exports.desc = 'Build the addon';
exports.builder = (yargs) => {
    yargs.demandOption(['src', 'dist']);
};
exports.handler = async function (argv) {

    console.log('[BUILD] Start build');         
    await cleanUpDistFolder(argv);
    await copySrcFolderToDist(argv);            
    console.log('[BUILD] Finished');
};

const cleanUpDistFolder = (config) => {
    
    var distFolder = config.dist + config.packagename;
    if (config.verbose) 
        console.log('[BUILD] Cleaning up dist folder: ' + distFolder);

    return fs.remove(distFolder);
};

const copySrcFolderToDist = (config) => {

    var distFolder = config.dist + config.packagename;
	return new Promise((resolve, reject) => {

        var copyPaths = [
            '**/*.*',
            '!test*/**/*.*',
            '!package.json',
            '!**/*.pyc'
        ];

        // copy new files
        var options = {
            cwd: config.src,
            gitignore: true
        };

        const paths = globby.sync(copyPaths, options);
        
        for(var i in paths) {
            var path = paths[i];
            var srcPath = config.src + path;
            var destPath = distFolder + '/' + path;
            if (config.verbose) {
                console.log('[BUILD] Copying '+ srcPath + ' to ' + destPath);
            }
            fs.copySync(srcPath, destPath);
        }
        
        resolve();
    });
}