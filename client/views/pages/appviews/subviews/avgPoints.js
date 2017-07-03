Template.avgPoints.events({
    'click .remove': ( event, template ) => {
        event.preventDefault();
        template.$(template.firstNode).addClass('hidden');
        template
            .$(template.firstNode)
            .find('input[type=hidden]')
            .each(function(){
                $(this).val("")
            });
        return true;
    }
});