var Workshop = Workshop || {};
Workshop.List = function() {};

Workshop.List.clear = function() {
    $('#blogPostList').html('');
};

Workshop.List.appendPost = function(post) {
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
        hoodie.store.find("post", String($(event.target).data("id"))).done(Workshop.Form.setValues);

        event.preventDefault();
        return false;
    });

    $(listItem).find("button").unbind("click").bind("click", function (event) {
        hoodie.store.remove("post", String($(event.target).data("id"))).done(refreshList);

        event.preventDefault();
        return false;
    });
}
