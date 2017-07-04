Template.SocialDoc.onRendered(()=>{
    $('.input-group.date').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        autoclose: false,
        language: 'ru',
        format: "dd.mm.yyyy",
        weekStart: 1,
        calendarWeeks: false,
        todayHighlight: true
    });
});

Template.SocialDoc.events({
    'click .socialDocContent':( event, template ) => {
        let $this = $(event.currentTarget);
<<<<<<< HEAD
        console.log(event.clientY);
        console.log($this.offset().top + 25);
        if(event.clientX >= $this.outerWidth()+$this.offset().left && event.clientY+document.body.scrollTop <= $this.offset().top + 25){
=======
        if(event.clientX > $this.outerWidth()+$this.offset().left && event.clientY < $this.offset().top + 25){
>>>>>>> 06ebaafebcfad1825792fc29a7a4d799e5633c67
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