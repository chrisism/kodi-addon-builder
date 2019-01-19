#! /usr/bin/env node
const findUp = require('find-up')
const fs = require('fs')

const getCurrentVersion = (argv) => {
    
    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    var version = pkg.version;
    
    return {version}
}

console.log("Kodi Addon Builder Scripts");
const configPath = findUp.sync(['.addon', '.addon.json'])
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {}

require('yargs')
    .config(config)
    .commandDir('cmds')
    .middleware(getCurrentVersion)
    .option('verbose', { alias: 'v', default: false, describe: 'Apply verbose output' })
    .option('packagename', { alias: 'n', demandOption: true, describe: 'Name of the package', group: 'Defaults'  })
    .option('src', { alias: 's', default: './src/', describe: 'The source files folder to build from.', group: 'Build folders' })
    .option('dist', { alias: 'd', default: './dist/', describe: 'The folder for the build result or distributable files', group: 'Build folders'  })
    .demandCommand()
    .help()
    .epilogue('Important: All paths to directories should end with a trailing slash. \n We support .rc config files by adding .addon file in the folder.')
    .wrap(95)
    .fail(function (msg, err, yargs) {
        if (err) 
            throw err // preserve stack

        console.error('Operation failed')
        console.error(msg)
        console.error('Execute with --help for more details.')
        process.exit(1)
      })
    .argv;
