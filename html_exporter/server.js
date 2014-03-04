var marked = require('marked'),
    request = require('request'),
    _ = require('underscore'),
    follow = require('follow'),
    blogUtils = require('./blog_utils');
// create the output directory
blogUtils.mkdirRecursive('output/user');

var couchAdminPass = 'admin',
    couchPort = '5984';

if(process.env.COUCH_ADMIN_PASS) {
    couchAdminPass = process.env.COUCH_ADMIN_PASS;
}

if(process.env.COUCH_PORT) {
    couchPort = process.env.COUCH_PORT;
}

var couchUrl = 'http://admin:' + couchAdminPass + '@localhost:' + couchPort;
request(couchUrl + '/_users/_all_docs?include_docs=true', function (error, response, body) {
    var users = JSON.parse(body).rows.map(function(row) {
         return row.doc;
        }),
        usersWithDatabases;

    usersWithDatabases = users.filter(function(user) {
        return typeof user.database === 'string';
    });


    blogUtils.writeFileWithTemplate(
        'output/index.html',
        'blog_list',
        {users: usersWithDatabases}
    );

    usersWithDatabases.forEach(function(user) {
        generateUserPostIndex(user, user.database);
        monitorUserDatabase(user);
    });
});

function monitorUserDatabase(user) {
    var database = user.database;
    blogUtils.mkdirRecursive("output/" + database + "/post")

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

                generateUserPostIndex(user);
            }
        }
    );
}

function getPostFilename(database, documentId) {
    return 'output/' + database + '/' +  documentId + '.html';
}

function deletePost(database, documentId) {
    blogUtils.deleteFile(getPostFilename(database, documentId));
}


function renderPost(database, documentId) {
    request(
        couchUrl + '/' + encodeURIComponent(database) + '/' + encodeURIComponent(documentId),
        function(error, response, body) {
            var doc = JSON.parse(body);
            if(doc.state === 'published') {
                doc.text = marked(doc.text)
                blogUtils.writeFileWithTemplate(
                    getPostFilename(database, documentId),
                    'post',
                    doc
                )
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

            blogUtils.writeFileWithTemplate(
                'output/' + user.database + '/index.html',
                'post_list',
                {user: user, posts: publishedPostDocuments}
            );
        }
    );
}
