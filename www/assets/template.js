var Workshop = Workshop || {};
Workshop.Template = function() {};

Workshop.Template.render = function(target, file, context, success) {
    $.get(file, function(templateSource) {
        var template = Handlebars.compile(templateSource);
        $(target).html(template(context));
        success();
    });
}
