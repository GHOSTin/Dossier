const XLSX = require('xlsx');
import {ReactiveDict} from 'meteor/reactive-dict'

Template.reports.onCreated( function() {
    this.report = new ReactiveDict();
    this.report.set('reportTemplate', false);
    this.report.set('reportData', false);
});

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
        return Template.instance().report.get('reportTemplate');
    },
    reportData() {
        return Template.instance().report.get('reportData');
    },
});

Template.reports.events({
    'shown.bs.tab [data-name="reportsList"]>li>a[data-toggle="tab"]':( event, template ) => {
        template.report.set('reportName', $(event.target).data('report'))
        template.report.set('reportTemplate', false);
        template.report.set('reportData', false);
    },
    'click [data-name="createReport"]': ( event, template ) => {
        event.preventDefault();
        let report = template.report.get('reportName');
        Meteor.call(report, function(error, result){
            if (error) {
                Bert.alert(error.reason, 'fixed-top', 'danger', 'fa-file-text-o' )
            } else {
                template.report.set('reportTemplate', report);
                template.report.set('reportData', result);
            }
        })
    },
    'click [data-name="saveReport"]': ( event, template ) => {
        event.preventDefault();
        let report = template.report.get('reportName'),
            wb = { SheetNames:[], Sheets:{} };
        switch(report){
            case 'dailyStatisticReport':
                wb = XLSX.utils.table_to_book($('[data-name="reportData"]').find('table')[0], {dateNF: "dd.mm.yyyy"});
                break;
            case 'PRReport':
                let ws1 = XLSX.utils.table_to_sheet($('#informers').find('table')[0]),
                    ws2 = XLSX.utils.table_to_sheet($('#choose').find('table')[0]);
                wb.SheetNames.push("Report1");
                wb.Sheets["Report1"] = ws1;
                wb.SheetNames.push("Report2");
                wb.Sheets["Report2"] = ws2;
                break;
            case 'specializationReport':
                $('[data-name="reportData"]').find('.specialization a[data-toggle="tab"]').each(function(){
                    wb.SheetNames.push($(this).text());
                    let ws = XLSX.utils.table_to_sheet($($(this).attr('href')).find('table')[0], {dateNF: "dd.mm.yyyy"})
                    wb.Sheets[$(this).text()] = ws;
                });
                break;
        };
        let wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: false, type: 'binary', cellDates: true, cellStyles: true});
        saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "report.xlsx");
    }
});

function s2ab(s) {
    let buf = new ArrayBuffer(s.length),
        view = new Uint8Array(buf);
    for(let i=0; i!==s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf
}