var marked = require('marked'),
    request = require('request'),
    fs = require('fs'),
    _ = require('underscore')
    follow = require('follow');

// create the output directory
if(!fs.existsSync("output")) {
    fs.mkdirSync("output");
    fs.mkdirSync("output/user");
}

// [x] user index
// [x] user seperation
// [x] post index
// [ ] ausgabe
// [x] datieen löschen

var couchUrl = 'http://admin:admin@localhost:6003';

request(couchUrl + '/_users/_all_docs?include_docs=true', function (error, response, body) {
    var users = JSON.parse(body).rows.map(function(row) {
         return row.doc;
        }),
        usersWithDatabases,
        userDatabases;

    usersWithDatabases = users.filter(function(user) {
        return typeof user.database === 'string';
    });

    userDatabases = usersWithDatabases.map(function(user) {
        return user.database;
    });

    fs.writeFile(
        'output/index.html',
        usersWithDatabases.map(
            function(user) {
                return '<a href="' + user.database + '/index.html">' + user.name + '</a>';
            }
        ).join('<br>')
    );

    usersWithDatabases.forEach(function(user) {
        generateUserPostIndex(user, user.database);
        monitorUserDatabase(user.database);
    });
});

function monitorUserDatabase(database) {
    if(!fs.existsSync("output/" + database)) {
        fs.mkdirSync("output/" + database);
        fs.mkdirSync("output/" + database + "/post");
    }

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
                if(change.deleted === 'true') {
                    deletePost(database, documentId);
                } else {
                    renderPost(database, change.id)
                }
            }
        }
    );
}

function getPostFilename(database, documentId) {
    return 'output/' + database + '/' +  documentId + '.html';
}

function deletePost(database, documentId) {
    if(fs.existsSync(getPostFilename(database, documentId))) {
        fs.unlinkSync(getPostFilename(database, documentId));
    }
}

function renderPost(database, documentId) {
    request(
        couchUrl + '/' + encodeURIComponent(database) + '/' + encodeURIComponent(documentId),
        function(error, response, body) {
            var doc = JSON.parse(body);
            if(doc.state === 'published') {
                fs.writeFile(getPostFilename(database, documentId), marked(doc.text));
            } else {
                deletePost(database, documentId);
            }
        }
    );
}

function generateUserPostIndex(user) {
    request(
        couchUrl + '/' + encodeURIComponent(user.database) + '/_all_docs?include_docs=true',
        function(error, response, body) {
            var response,
                publishedPostDocuments;

            response = JSON.parse(body);
            publishedPostDocuments = response.rows.filter(function(row) {
                return row.doc.type === 'post'
                    && row.doc.state === 'published';
            });

            fs.writeFile(
                'output/' + user.database + '/index.html',
                publishedPostDocuments.map(
                    function(post) {
                        return '<a href="' + post.doc._id + '.html">' + post.doc.title + '</a>';
                    }
                ).join('<br>')
            );
        }
    );
}
