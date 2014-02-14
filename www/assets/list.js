var Workshop = Workshop || {};
Workshop.List = function() {
    this.posts = [];
    this.stateMap = {
        editing: "pencil",
        published: "ok",
        archived: "off",
    };
};

Workshop.List.prototype.clear = function() {
    this.posts = [];
    this.render();
};

Workshop.List.prototype.appendPost = function(post) {
    this.posts.push(post);
    console.log(this.posts);
    this.render();
};

Workshop.List.prototype.render = function(post) {
    var stateMap = this.stateMap;
    this.posts.forEach(function (post) {
        post.stateIcon = stateMap[post.state];
    });

    Workshop.Template.render(
        '#blogPostList',
        '/template/blogPosts.html',
        {"posts": this.posts},
        function () {
            $('#blogPostList').find("a").unbind("click").bind("click", function (event) {
                hoodie.store.find("post", String($(event.target).data("id"))).done(Workshop.Form.setValues);

                event.preventDefault();
                return false;
            });

            $('#blogPostList').find("button").unbind("click").bind("click", function (event) {
                hoodie.store.remove("post", String($(event.target).data("id"))).done(refreshList);

                event.preventDefault();
                return false;
            });
        }
    );
}
