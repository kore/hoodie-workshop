// Initialize Hoodie
var hoodie  = new Hoodie();

// Initial load of all todo items from the store
function refreshList() {
    hoodie.store.findAll('post').then( function(posts) {
        Workshop.List.clear();
        posts.sort(function(a, b) {
            return a.createdAt > b.createdAt;
        }).forEach(Workshop.List.appendPost);
    });
}
refreshList();

// When a new todo gets stored, add it to the UI
hoodie.store.on('add:post', Workshop.List.appendPost)

// Clear post list when the get wiped from store
hoodie.account.on('signin reauthenticated', Workshop.Form.activate);

hoodie.account.on(
    'signout',
    function() {
        Workshop.List.clear();
        Workshop.Form.clear();
        Workshop.Form.deactivate();
    }
);

// Handle creating a new post
$('#blogPostForm').on('submit', function(event) {
    if (id = $(event.target).find("input[name='id']").val()) {
        hoodie.store.update('post', id, Workshop.Form.getValues());
        refreshList();
    } else {
        hoodie.store.add('post', Workshop.Form.getValues());
    }

    Workshop.Form.clear();

    event.preventDefault();
    return false;
});

