const XLSX = require('xlsx');

Template.reports.rendered = function(){

    // Add special class for full height
    $('body').addClass('full-height-layout');

    // Set the height of the wrapper
    $('#page-wrapper').css("min-height", $(window).height()  + "px");

    // Add slimScroll to element
    $('.full-height-scroll').slimscroll({
        height: '100%'
    });

    // Add slimScroll to left navigation
    $('.sidebar-collapse').slimScroll({
        height: '100%',
        railOpacity: 0.9
    });
};

Template.reports.destroyed = function(){

    // Remove special class for full height
    $('body').removeClass('full-height-layout');

    // Destroy slimScroll for left navigation
    $('.sidebar-collapse').slimScroll({
        destroy:true
    });

    // Remove inline style form slimScroll
    $('.sidebar-collapse').removeAttr("style");
};

Template.reports.helpers({
    reportTemplate() {
        return Session.get('reportTemplate');
    },
    reportData() {
        return Session.get('reportData');
    },
});

Template.reports.events({
    'click #dailyStatisticReport': ( event, template ) => {
        event.preventDefault();
        Meteor.call('dailyStatistic', function(error, result){
            if (error) {
                Bert.alert(error.reason, 'fixed-top', 'danger', 'fa-file-text-o' )
            } else {
                console.log(result);
                Session.set('reportTemplate', 'dailyStatisticReport');
                Session.set('reportData', result);
                template.$('[data-name="saveStatisticReport"]').prop('disabled', false);
                /*const XLSX = require('xlsx');
                let wopts = {bookType: 'xlsx', bookSST: false, type: 'binary'},
                    wbout = XLSX.write(result, wopts);
                saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "report.xlsx");*/
            }
        })
    },
    'click [data-name="saveStatisticReport"]': ( event, template ) => {
        event.preventDefault();
        let wb = XLSX.utils.table_to_book($('#reportData').find('table')[0], {sheet: "Report"}),
            wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: false, type: 'binary'});
        saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "report.xlsx");
    }
});

function s2ab(s) {
    let buf = new ArrayBuffer(s.length),
        view = new Uint8Array(buf);
    for(let i=0; i!==s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf
}