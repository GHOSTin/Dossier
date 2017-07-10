Template.studentAdvData.onRendered(function(){
    $('.input-group.date.only-years').datepicker({
        keyboardNavigation: false,
        forceParse: false,
        autoclose: false,
        language: 'ru',
        format: "yyyy",
        viewMode: 'years',
        minViewMode: 'years'
    });
});
