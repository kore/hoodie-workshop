var Workshop = Workshop || {};
Workshop.Form = function() {};

Workshop.Form.activate = function() {
    $('#blogPostForm').find('input, select, button, textarea').prop('disabled', false);
};

Workshop.Form.deactivate = function() {
    $('#blogPostForm').find('input, select, button, textarea').prop('disabled', true);
};

Workshop.Form.clear = function() {
  $('#blogPostForm').find("input, textarea").val("");
};

Workshop.Form.getValues = function() {
    return {
        title: $('#blogPostForm').find("input[name='title']").val(),
        text:  $('#blogPostForm').find("textarea[name='text']").val(),
        state: $('#blogPostForm').find("select[name='state']").val()
    };
};

Workshop.Form.setValues = function(post) {
    $("#blogPostForm input[name='id']").val(post.id);
    $("#blogPostForm input[name='title']").val(post.title);
    $("#blogPostForm textarea[name='text']").val(post.text);
    $("#blogPostForm select[name='state']").val(post.state);
};
