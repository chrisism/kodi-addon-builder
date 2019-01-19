# kodi-addon-builder
Addon build scripts for KODI. With these scripts you can build, package and install your addons for KODI. 

## Usage
```
Commands:
  cli.js build       Build the addon
  cli.js install     Install the addon in local Kodi
  cli.js package     Package the addon into a zip                               [aliases: pack]
  cli.js versioning  Get and set version for the addon

Defaults
  --packagename, -n  Name of the package                                             [required]

Build folders
  --src, -s   The source files folder to build from.                        [default: "./src/"]
  --dist, -d  The folder for the build result or distributable files       [default: "./dist/"]

Options:
  --version      Show version number                                                  [boolean]
  --verbose, -v  Apply verbose output                                          [default: false]
  --help         Show help                                                            [boolean]
```

Important: All paths to directories should end with a trailing slash.

### Build
```bash
addon build --packagename plugin.myplugin
```
Will copy all needed files from the source directory to the dist folder.

Options:
* packagename: Name of the package
* src: Source folder to copy files from
* dist: Destination folder for all distribution files

### Package
```bash
addon package --packagename plugin.myp
```
Will package all the files from the dist folder into a zip file, ready for deployment.

Options:
* packagename: Name of the package
* dist: Destination folder for all distribution files

### Install
```bash
addon install --packagename plugin.myp
```
Installs the addon into the local KODI instance (addons folder) and calls reload skin through KODI JSON-RPC.

Options:
* packagename: Name of the package
* dist: Destination folder for all distribution files
* host: Hostname
* port: Port
* user: Username to access
* password: Password to accces

## Configuration files
We support .rc config files by adding .addon file in the folder.
Example of config file:
```json
{
    "packagename": "plugin.myplugin",
    "src": "./src/",
    "dist": "./dist/",
    "repositoryfolder": "./dist/",
    "semver": "patch",
    "addonsfolder": "%AppData%\\Roaming\\Kodi\\addons\\",
    "host": "localhost",
    "port": "8080",
    "user": "kodi",
    "password": "kodi"
}
```