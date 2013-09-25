// Initialize Hoodie
var hoodie  = new Hoodie();

// Initial load of all todo items from the store
function refreshList() {
  hoodie.store.findAll('post').then( function(posts) {
    $('#blogPostList').html('');
    posts.sort(function(a, b) {
      return a.createdAt > b.createdAt;
    }).forEach(appendPost);
  });
}
refreshList();

// When a new todo gets stored, add it to the UI
hoodie.store.on('add:post', appendPost)

// Clear post list when the get wiped from store
hoodie.account.on(
  'signin',
  function() {
    $('#blogPostForm').find('input, select, button, textarea').prop('disabled', false);
  }
);

hoodie.account.on(
  'signout',
  function() {
    $('#blogPostList').html('');
    $('#blogPostForm').find('input, select, button, textarea').prop('disabled', true);
  }
);

// Handle creating a new post
$('#blogPostForm').on('submit', function(event) {
  if (id = $(event.target).find("input[name='id']").val()) {
    hoodie.store.update(
      'post', id, {
        title: $(event.target).find("input[name='title']").val(),
        text:  $(event.target).find("textarea[name='text']").val(),
        state: $(event.target).find("select[name='state']").val()
    });

    refreshList();
  } else {
    hoodie.store.add(
      'post', {
        title: $(event.target).find("input[name='title']").val(),
        text:  $(event.target).find("textarea[name='text']").val(),
        state: $(event.target).find("select[name='state']").val()
    });
  }

  $(event.target).find("input, textarea").val("");

  event.preventDefault();
  return false;
});

function appendPost(post) {
  var stateMap = {
    editing: "pencil",
    published: "ok",
    archived: "off",
  }

  listItem = $('#blogPostList').prepend('<li>' +
    '<i class="icon icon-' + stateMap[post.state] + '"></i>' +
    ' <a class="edit" data-id="' + post.id + '" href="#">' + post.title + '</a> ' +
    ' at ' + post.createdAt +
    ' <button class="btn btn-mini btn-danger" data-id="' + post.id + '"><i class="icon icon-remove"></i></a>' +
  '</li>');

  $(listItem).find("a").unbind("click").bind("click", function (event) {
    hoodie.store.find("post", String($(event.target).data("id"))).done(function (post) {
      $("#blogPostForm input[name='id']").val(post.id);
      $("#blogPostForm input[name='title']").val(post.title);
      $("#blogPostForm textarea[name='text']").val(post.text);
      $("#blogPostForm select[name='state']").val(post.state);
    });

    event.preventDefault();
    return false;
  });

  $(listItem).find("button").unbind("click").bind("click", function (event) {
    hoodie.store.remove("post", String($(event.target).data("id"))).done(function () {
      refreshList();
    });

    event.preventDefault();
    return false;
  });
}

