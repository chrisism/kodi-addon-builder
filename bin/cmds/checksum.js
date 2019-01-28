const fs = require("fs-extra");
const md5File = require("md5-file/promise");

exports.command = 'checksum';
exports.desc = 'Generate checksum files (.md5) based on input file.';
exports.builder = (yargs) => {
    yargs
    .option('sourcefile', { alias: 'sf', describe: 'File to create checksum for' })
    .demandOption(['sourcefile']);
};

exports.handler = async function (argv) {

    console.log('[CHECKSUM] Start checksum action');
    await createChecksumForFileFromCli(argv);
    console.log('[CHECKSUM] Finished');
};

const createChecksumForFileFromCli = (config) => {
    
    var filePath = config.sourcefile;

    if (config.verbose) {
        console.log('[CHECKSUM] Creating checksum for: ' + filePath);
    }

    return exports.createChecksumFile(filePath);
};

exports.createChecksumFile = (filePath) => {

    var filePathChecksum = filePath + '.md5';
    var hash = md5File.sync(filePath);

    return fs.writeFile(filePathChecksum, hash);
}