Template.graduateAdvData.onRendered(function(){
    $('.input-group.date').datepicker({
        keyboardNavigation: false,
        forceParse: false,
        autoclose: false,
        language: 'ru',
        format: "yyyy",
        viewMode: 'years',
        minViewMode: 'years'
    });
});
