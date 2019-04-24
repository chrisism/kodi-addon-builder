const globby = require("globby");
const fs = require("fs-extra");
const request = require('request');

exports.command = 'install';
exports.desc = 'Install the addon in local Kodi';
exports.builder = (yargs) => {
    yargs
        .option('addonsfolder', { alias: 'a', default: '%appdata%\\Roaming\\Kodi\\addons', describe: 'The KODI folder with the addons' })
        .option('ignorefail', { alias: 'i', default: false, describe: 'Ignore copy failures and continue'})
        .option('host', { alias: 'h', default: 'localhost', describe: 'Hostname', group: 'KODI JSON-RPC' })
        .option('port', { alias: 'p', default: '8080', describe: 'Port', group: 'KODI JSON-RPC'  })
        .option('user', { alias: 'u', default: 'kodi', describe: 'Username to access', group: 'KODI JSON-RPC'  })
        .option('password', { alias: 'pw', default: 'kodi', describe: 'Password to accces', group: 'KODI JSON-RPC'  })
        .demandOption(['dist', 'addonsfolder']);
};

exports.handler = async function (argv) {

    console.log('[INSTALL] Start installing in KODI');
    await cleanupAddonFolderInKodi(argv);
    await copyDistFolderToKodi(argv);
    await reloadKodiSkin(argv);
    console.log('[INSTALL] Finished');
};

const cleanupAddonFolderInKodi = (config) => {
    var kodiFolder = config.addonsfolder + config.packagename;    
    //'!' + kodiFolder + '\\media\\*.xbt'
    
    if (config.verbose) 
        console.log('[INSTALL] Cleaning up KODI folder: ' + kodiFolder);

    return fs.remove(kodiFolder).catch(err => {
        console.log(err);
    });
};


const copyDistFolderToKodi = (config) => {

    var kodiFolder = config.addonsfolder + config.packagename;    
    var distPackageFolder = config.dist + config.packagename;    

	return new Promise((resolve, reject) => {
        
        var copyPaths = [
            '**/*.*',
            '!**/*.pyc'
        ];

        // copy new files
        var options = {
            cwd: distPackageFolder,
            gitignore: true
        };

        const paths = globby.sync(copyPaths, options);
        
        for(var i in paths) {
            var path = paths[i];
            var srcPath = distPackageFolder + '/' + path;
            var destPath = kodiFolder + '/' + path;

            if (config.verbose)
                console.log('[INSTALL] Copying '+ srcPath + ' to ' + destPath);

            try {
                fs.copySync(srcPath, destPath);
            } catch(err) {
                console.log(`Error while copying ${srcPath} Error: ${err}`);
                if (!config.ignorefail) {
                    throw err;
                }
            }
        }
        resolve();
    });
};

const reloadKodiSkin = (config) => {
       
    var auth = '';
    if (config.user !== '') {
        auth = auth + config.user;
    }
    if (config.password !== '') {
        auth = auth + ':' + config.password;
    }
    if (auth !== '') {
        auth = auth + '@';
    }

    var url = 'http://' + auth + config.host + ':' + config.port + '/jsonrpc';
    var body = JSON.stringify({ "jsonrpc": "2.0", "id": 1, "method": "Addons.ExecuteAddon", "params": { "addonid": "script.toolbox", "params": { "info": "builtin", "id": "ReloadSkin()" } } });

    var post_options = {
        url: url,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'  
        },
        body: body
    };

    return new Promise((resolve, reject) => {
        request.post(post_options, function (error, response, rbody) {
            if (error) {
                if (config.verbose)
                    return console.error('[INSTALL] POST failed:', error);
            }

            if (config.verbose)
               console.log('[INSTALL] POST successful!  Server responded with:', rbody);

            resolve();
        });
    });
};