var marked = require('marked'),
    request = require('request'),
    fs = require('fs'),
    _ = require('underscore')
    follow = require('follow');

// create the output directory
if(!fs.existsSync("post")) {
    fs.mkdirSync("post");
}

var couchUrl = 'http://admin:telnet@localhost:5984';

request(couchUrl + '/_all_dbs', function (error, response, body) {
    var databases = JSON.parse(body),
        userDatabases;

    userDatabases = databases.filter(function(database) {
        return database.substring(0, 5) === 'user/';
    });

    userDatabases.forEach(monitorUserDatabase);
});

function monitorUserDatabase(database) {
    request(
        couchUrl + '/' + encodeURIComponent(database) + '/_all_docs',
        function(error, response, body) {
            var response,
                postDocuments,
                postDocumentIds;

            response = JSON.parse(body);
            postDocuments = response.rows.filter(function(doc) {
                return doc.id.substring(0, 5) === 'post/';
            });

            postDocumentIds = postDocuments.map(function(doc) {
                return doc.id;
            });

            postDocumentIds.forEach(function(documentId) {
                renderPost(database, documentId);
            });
        }
    );
    follow(
        {
            db:couchUrl + '/' + encodeURIComponent(database),
            feed: 'continuous',
            since: 'now',
            include_docs: false
        },
        function(error, change) {
            if(change.id.substring(0, 5) === 'post/') {
                renderPost(database, change.id)
            }
        }
    );
}

function renderPost(database, documentId) {
    request(
        couchUrl + '/' + encodeURIComponent(database) + '/' + encodeURIComponent(documentId),
        function(error, response, body) {
            var doc = JSON.parse(body);
            if(doc.state === 'published') {
                fs.writeFile(doc._id  + '.html', marked(doc.text));
            } else {
                // remove file
            }
        }
    );
}
