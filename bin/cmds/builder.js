const path = require('path');
const os = require('os');
const globby = require("globby");
const fs = require("fs-extra");
const shell = require('shelljs');

exports.command = ['build'];
exports.desc = 'Build the addon';
exports.builder = (yargs) => {

    yargs
        .option('texturefolders', { alias: 'tf', describe: 'Paths to directories to create texture files out of', group: 'Textures' })
        .option('srcpaths', { alias: 'sp', default: ['**/*.*', '!package.json'], describe: 'Paths/patterns to get files from source folder.', group: 'Build folders' })
        .demandOption(['src', 'dist']);
};
exports.handler = async function (argv) {

    console.log('[BUILD] Start build');         
    await cleanUpDistFolder(argv);
    await copySrcFolderToDist(argv);
    await packageTextures(argv);            
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
        
        if (config.verbose) 
            console.log('[BUILD] Start copying to dist folder: ' + distFolder);

        if (!config.srcpaths || config.srcpaths.length == 0)
            config.srcpaths = ['**/*.*'];

        // copy new files
        const paths = globby.sync(config.srcpaths, { cwd: config.src, gitignore: true });
        
        for(var i in paths) {
            var subPath = paths[i];
            var srcPath = config.src + subPath;
            var destPath = distFolder + path.sep + subPath;
            if (config.verbose) {
                console.log('[BUILD] Copying '+ srcPath + ' to ' + destPath);
            }
            fs.copySync(srcPath, destPath);
        }
        
        resolve();
    });
};

const packageTextures = (config) => {

    return new Promise((resolve, reject) => {

        if (config.texturepaths == null || config.texturepaths.length == 0) {
            resolve();
            return;
        }
        
        var localPath = '';
        try {
            localPath = require.resolve('kodi-addon-builder/package.json');
            localPath = path.dirname(localPath);
        } catch {
        }

        for (var i in config.texturepaths) {
            var texturePath = config.dist + config.texturepaths[i];

            var pathSegments =  texturePath.split(/\\|\//).filter(p => p);
            var packageName = pathSegments.pop()  + '.xbt';
            var outputFile = pathSegments.concat(packageName).join(path.sep);
            
            if (config.verbose)
                console.log('[BUILD] Create texture package: ' + outputFile);

            var osfolder = 'windows';
            if (os.type() === 'Linux')
                osfolder = 'linux';
            else if(os.type() === 'Darwin')
                osfolder = 'macos';

            var cmdPath = [localPath, 'tools', 'kodi-texturepacker', osfolder].join(path.sep) + path.sep;            
            var cmd = cmdPath + 'texturepacker -dupecheck -input ' + texturePath + ' -output ' + outputFile;
            
            if (config.verbose)
                console.log('[BUILD] Executing: ' + cmd);

            shell.exec(cmd, {silent: !config.verbose});

            if (config.verbose)
                console.log('[BUILD] Removing original texturepath: ' + texturePath);

            fs.remove(texturePath)
        }

        resolve();
    });
};