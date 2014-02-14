var path = require('path'),
    fs = require('fs');

/**
 * Recursively creates a directory.
 *
 * This function is idempotent, already existing directories will not cause any issues :)
 * @param pathToDir
 */
exports.mkdirRecursive = function(pathToDir) {
    pathSegments = path.normalize(pathToDir).split(path.sep);
    var currentPath = '';

    pathSegments.forEach(function(pathSegment){
        currentPath = path.join(currentPath, pathSegment);
        if(!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }
    });
};

/**
 * Idempotent file deletion
 *
 * @param pathToFile
 */
exports.deleteFile = function(pathToFile) {
    if(fs.existsSync(pathToFile)) {
        fs.unlinkSync(pathToFile);
    }
};

/**
 * @param pathToFile file to create
 * @param template template to use
 * @param data data to use
 */
exports.writeFileWithTemplate = function(pathToFile, template, data) {

};
