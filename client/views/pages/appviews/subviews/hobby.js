Template.hobby.events({
    'click .hobbiesContent':( event, template ) => {
        let $this = $(event.currentTarget);
        if(event.clientX > $this.outerWidth()+$this.offset().left && event.clientY < $this.offset().top + 25){
            template.$(template.firstNode).addClass('hidden');
            template
                .$(template.firstNode)
                .find('input[type=text]')
                .each(function(){
                    $(this).val("")
                });
            return true;
        }
    }
});