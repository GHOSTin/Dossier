const XLSX = require('xlsx');
import {ReactiveDict} from 'meteor/reactive-dict'
import {Students} from '/lib/collections/students'

Template.reports.onCreated( function() {
    this.autorun(() => {
        this.subscribe('students');
        this.subscribe('abiturients');
    });
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
    let $b = $('#builder');

    var options = {
        lang_code: 'ru',
        allow_empty: true,
        sort_filters: true,
        plugins: {
            'bt-tooltip-errors': { delay: 100 },
            'sortable': null,
            'filter-description': { mode: 'popover' },
            'bt-selectpicker': null,
            'unique-filter': null,
            'bt-checkbox': { color: 'primary' },
            'invert': null,
            'not-group': null
        },
        operators: [
            { type: 'equal', optgroup: 'Базовые' },
            { type: 'not_equal', optgroup: 'Базовые' },
            { type: 'in', optgroup: 'Базовые' },
            { type: 'not_in', optgroup: 'Базовые' },
            { type: 'less', optgroup: 'Работа с числами' },
            { type: 'less_or_equal', optgroup: 'Работа с числами' },
            { type: 'greater', optgroup: 'Работа с числами' },
            { type: 'greater_or_equal', optgroup: 'Работа с числами' },
            { type: 'between', optgroup: 'Работа с числами' },
            { type: 'not_between', optgroup: 'Работа с числами' },
            { type: 'begins_with', optgroup: 'Работа со строками' },
            { type: 'not_begins_with', optgroup: 'Работа со строками' },
            { type: 'contains', optgroup: 'Работа со строками' },
            { type: 'not_contains', optgroup: 'Работа со строками' },
            { type: 'ends_with', optgroup: 'Работа со строками' },
            { type: 'not_ends_with', optgroup: 'Работа со строками' },
            { type: 'is_empty' },
            { type: 'is_not_empty' },
            { type: 'is_null' },
            { type: 'is_not_null' }
        ],
        icons: {
            add_group:    'fa fa-plus-sign',
            add_rule:     'fa fa-plus',
            remove_group: 'fa fa-remove',
            remove_rule:  'fa fa-remove',
            error:        'fa fa-warning-sign'
        },
        filters: [
            {
                id: 'lastname',
                field: 'lastname',
                label: {
                    ru: 'Фамилия'
                },
                value_separator: ',',
                type: 'string',
                default_value: '',
                size: 30,
                validation: {
                    allow_empty_value: true
                },
            },
            {
                id: 'firstname',
                field: 'firstname',
                label: {
                    ru: 'Имя'
                },
                value_separator: ',',
                type: 'string',
                default_value: '',
                size: 30,
                validation: {
                    allow_empty_value: true
                },
            },
            {
                id: 'middlename',
                field: 'middlename',
                label: {
                    ru: 'Отчество'
                },
                value_separator: ',',
                type: 'string',
                default_value: '',
                size: 30,
                validation: {
                    allow_empty_value: true
                },
            },
        ]
    }
    $b.queryBuilder(options);
    $b.on('afterCreateRuleInput.queryBuilder', function(e, rule) {
        if (rule.filter.plugin == 'selectize') {
            rule.$el.find('.rule-value-container').css('min-width', '200px')
                .find('.selectize-control').removeClass('form-control');
        }
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
            case 'KISReport':
                wb = XLSX.utils.table_to_book($('[data-name="reportData"]').find('table')[0], {raw: true, dateNF: 0});
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
    },
    'click #createQuery': (event) => {
        event.preventDefault();
        let query = $('#builder').queryBuilder('getMongo');
        let res = Students.find(query)
        console.log( $('#builder').queryBuilder('getRules'));
        console.log(res.fetch());
    }
});

function s2ab(s) {
    let buf = new ArrayBuffer(s.length),
        view = new Uint8Array(buf);
    for(let i=0; i!==s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf
}