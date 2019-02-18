# kodi-addon-builder
Addon build scripts for KODI. A collection of usefull tools and scripts so you can easily build, package and install your addons for KODI.

## Main features
* Build - Create a clean dist folder with only the files needed for distribution.
* Versioning - Use semver versioning for your addon and package.json.
* Package - Create versioned zipped packages of your addon so that you can easily distribute and install it.
* Install - Directly deploy your addon into your local Kodi instance for testing.
* Repository - Update your addon in your own Kodi repository and update all files and references.

## Usage
Start your local addon project by creating a new directory and then setup npm in that folder:
```bash
npm init
```

Install kodi-addon-builder in your project:
```bash
npm install kodi-addon-builder --save-dev
```

After developing your scripts or skins use these node commands:
```
Commands:
  cli.js build       Build the addon
  cli.js checksum    Generate checksum files (.md5) based on input file.
  cli.js install     Install the addon in local Kodi
  cli.js package     Package the addon into a zip                               [aliases: pack]
  cli.js repository  Package addon and update it in your repository folder
  cli.js versioning  Get and set version for the addon

Defaults
  --packagename, -n  Name of the package                                             [required]

Build folders
  --src, -s   The source files folder to get files from.                    [default: "./src/"]
  --dist, -d  The folder for the build result or distributable files       [default: "./dist/"]

Options:
  --version      Show version number                                                  [boolean]
  --verbose, -v  Apply verbose output                                          [default: false]
  --help         Show help                                                            [boolean]
```

Important: All paths to directories should end with a trailing slash.  
You can also use the bin command 'addon' through NPM instead of executing the cli.js file.

## NPM Scripts
To make it a bit easier, an example of scripts block for your own package.json:
```json
  "scripts": {
    "build": "addon build",
    "build-alpha": "addon versioning --semver prerelease --tag alpha && npm run build",
    "build-patch": "addon versioning --semver patch && npm run build",
    "build-minor": "addon versioning --semver minor && npm run build",
    "build-major": "addon versioning --semver major && npm run build",
    "build-pack": "npm run build && addon package",
    "build-pack-alpha": "npm run build-alpha && addon package",
    "build-pack-patch": "npm run build-patch && addon package",
    "build-pack-minor": "npm run build-minor && addon package",
    "build-pack-major": "npm run build-major && addon package",
    "build-publish": "npm run build && addon repository",
    "build-publish-alpha": "npm run build-alpha && addon repository",
    "build-publish-patch": "npm run build-patch && addon repository",
    "build-publish-minor": "npm run build-minor && addon repository",
    "build-publish-major": "npm run build-major && addon repository",
    "build-install": "npm run build && addon install",
    "build-install-alpha": "npm run build-alpha && addon install",
    "build-install-patch": "npm run build-patch && addon install",
    "build-install-minor": "npm run build-minor && addon install",
    "build-install-major": "npm run build-major && addon install"
  }
```

## Features

### Versioning
```bash
addon versioning --packagename plugin.myplugin --semver prerelease --tag alpha
```
With the versioning command you can easily update the version number of your addon and in the same time the version of your package.json. The package.json version number will be the version we start with and increment upon. When applying versioning will follow the (Semantic Versioning)[https://semver.org/] guidelines. 

Options
* ```semver```: The actual semver increment to apply. Choose from 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease' or nothing/empty. Major/minor/patch will increment the value of that specific part of the version number. Prepatch/minor/major will do the same but directly apply a prerelease to that version. Prerelease will increment the prerelease part after the dash of the version number e.g. ```1.0.0-2```. You can extend this by using the ```tag``` option.
* ```tag```: This will be the extra identifier or tag applied when using prerelease increment. Think of terms like 'alpha' or 'beta'. Using semver 'prerelease' and tag 'alpha' will produce ```1.0.0-alpha.2```.

### Build
```bash
addon build --packagename plugin.myplugin --src .\src\ --srcpaths **\*.* !package.json --dist .\.dist\ 
```
Will copy all needed files from the source directory to the dist folder. Afterwards will perform texturepacking actions for all configured folders.

Options:
* ```packagename```: Name of the package.
* ```src```: Source folder to copy files from.
* ```srcpaths```: Paths/patterns to get files from source folder. [Globby](https://github.com/sindresorhus/globby#readme) patterns are applied.
* ```dist```: Destination folder for all distribution files.
* ```texturefolders```: Paths to directories within dist folder to create texture files out of. 

#### TexturePacker
Info about texture packer on [kodi wiki](https://kodi.wiki/view/TexturePacker) and source used in this script on [Github](https://github.com/nottinghamcollege/kodi-texturepacker/). 
The supplied folders will be moved into a texture file (.xbt) with the same name as its parent directory. Note that the contents of the texturefolders will be removed afterwards, only leaving the xbt file behind. Texturefolders field must contain paths relative to the path provided in the dist option.

### Checksum
```bash
addon checksum --sourcefile ./plugin.myplugin/myfile.zip
```
Generate checksum files (.md5) based on input file. Result will be that a new file will be created next to the file given as an argument, which will only contain the md5 checksum of the specified file. New filename will be similar but with an extra '.md5' added to the end.

Options:
* ```sourcefile```: Path to the file to generate checksum file for.

### Package
```bash
addon package --packagename plugin.myplugin --zipfolder ./dist/zips/
```
Will package all the files from the dist folder into a zip file, ready for deployment. 

Options:
* ```packagename```: Name of the package.
* ```dist```: Destination folder for all distribution files.
* ```zipfolder```: Location to store the created package.

### Install
```bash
addon install --packagename plugin.myplugin
```
Installs the addon into the local KODI instance (addons folder) and calls reload skin through KODI JSON-RPC.

Options:
* ```packagename```: Name of the package
* ```dist```: Destination folder for all distribution files
* ```host```: Hostname
* ```port```: Port
* ```user```: Username to access
* ```password```: Password to accces


### Repository
```bash
addon repository --packagename plugin.myplugin
```
Package addon and update it in your repository folder, as well as updating the whole repository.  
It will package the addon in a zip file (so package command is not needed anymore) and copy the file into the appropriate sub directory within your repository folder. It will update the local addon.xml for your addon and also the addons.xml in the root. It will create all needed checksum files and update the folders
with directory listing pages in HTML for easy downloading.

Options:
* ```packagename```: Name of the package
* ```dist```: Destination folder for all distribution files
* ```zipfolder```: Location to store the created package
* ```repositoryfolder```: Location of your kodi repository (root directory).

## Configuration files
We support .rc config files by adding .addon file in the folder.
Example of config file:
```json
{
    "packagename": "plugin.myplugin",
    "src": "./src/",
    "srcpaths": [
        "**/*.*",
        "!test***/*.*",
        "!package.json",
        "!**/*.pyc"
    ],
    "dist": "./dist/",
    "texturepaths": [
        "plugin.myplugin/media/icons/"
    ],
    "zipfolder": "./.dist/",
    "repositoryfolder": "./repository.my/",
    "semver": "patch",
    "tag": "alpha",
    "addonsfolder": "%AppData%\\Roaming\\Kodi\\addons\\",
    "host": "localhost",
    "port": "8080",
    "user": "kodi",
    "password": "kodi"
}
```

## Questions or issues
Use the github issues page for this project or follow the thread on the [Kodi forum](https://forum.kodi.tv/showthread.php?tid=339544).  
[Changelog](https://raw.githubusercontent.com/chrisism/kodi-addon-builder/master/changelog.txt)