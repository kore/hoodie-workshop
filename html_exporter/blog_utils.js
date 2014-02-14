var path = require('path'),
    fs = require('fs'),
    handlebars = require('handlebars');

handlebars.registerHelper('username', function(username) {
    return username.substr(5);
});

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
exports.writeFileWithTemplate = function(pathToFile, templateFile, data) {
    var contentTemplate = handlebars.compile(
        fs.readFileSync(
            'templates/' + templateFile + '.html',
            {
                encoding: 'utf8'
            }
        )
    );

    var layoutTemplate = handlebars.compile(
        fs.readFileSync(
            'templates/layout.html',
            {
                encoding: 'utf8'
            }
        )
    );

    fs.writeFile(pathToFile, layoutTemplate({content: contentTemplate(data)}));
};
