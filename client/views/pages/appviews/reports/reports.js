require('pivottable');
const XLSX = require('xlsx');
import 'pivottable/dist/pivot.min.css';
import {ReactiveDict} from 'meteor/reactive-dict'
import {Students} from '/lib/collections/students'

Template.reports.onCreated(function () {
  this.autorun(() => {
    this.subscribe('students');
    this.subscribe('abiturients');
  });
  this.report = new ReactiveDict();
  this.report.set('reportTemplate', false);
  this.report.set('reportData', false);
});

Template.reports.rendered = function () {

  // Add special class for full height
  $('body').addClass('full-height-layout');

  // Set the height of the wrapper
  $('#page-wrapper').css("min-height", $(window).height() + "px");

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
      'bt-tooltip-errors': {delay: 100},
      'sortable': null,
      'filter-description': {mode: 'popover'},
      'bt-selectpicker': null,
      'unique-filter': null,
      'bt-checkbox': {color: 'primary'},
      'invert': null,
      'not-group': null
    },
    operators: [
      {type: 'equal', optgroup: 'Базовые'},
      {type: 'not_equal', optgroup: 'Базовые'},
      {type: 'in', optgroup: 'Базовые'},
      {type: 'not_in', optgroup: 'Базовые'},
      {type: 'less', optgroup: 'Работа с числами'},
      {type: 'less_or_equal', optgroup: 'Работа с числами'},
      {type: 'greater', optgroup: 'Работа с числами'},
      {type: 'greater_or_equal', optgroup: 'Работа с числами'},
      {type: 'between', optgroup: 'Работа с числами'},
      {type: 'not_between', optgroup: 'Работа с числами'},
      {type: 'begins_with', optgroup: 'Работа со строками'},
      {type: 'not_begins_with', optgroup: 'Работа со строками'},
      {type: 'contains', optgroup: 'Работа со строками'},
      {type: 'not_contains', optgroup: 'Работа со строками'},
      {type: 'ends_with', optgroup: 'Работа со строками'},
      {type: 'not_ends_with', optgroup: 'Работа со строками'},
      {type: 'is_empty'},
      {type: 'is_not_empty'},
      {type: 'is_null'},
      {type: 'is_not_null'}
    ],
    icons: {
      add_group: 'fa fa-plus-sign',
      add_rule: 'fa fa-plus',
      remove_group: 'fa fa-remove',
      remove_rule: 'fa fa-remove',
      error: 'fa fa-warning-sign'
    },
    filters: [
      {
        id: 'role',
        field: 'role',
        label: {
          ru: 'Статус'
        },
        input: 'select',
        type: 'string',
        values: {
          'student': 'Студент',
          'abiturient': 'Абитуриент'
        },
        operators: ['equal'],
        validation: {
          allow_empty_value: true
        },
      },
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
  $b.on('afterCreateRuleInput.queryBuilder', function (e, rule) {
    if (rule.filter.plugin == 'selectize') {
      rule.$el.find('.rule-value-container').css('min-width', '200px')
        .find('.selectize-control').removeClass('form-control');
    }
  });
};

Template.reports.destroyed = function () {

  // Remove special class for full height
  $('body').removeClass('full-height-layout');

  // Destroy slimScroll for left navigation
  $('.sidebar-collapse').slimScroll({
    destroy: true
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
  'shown.bs.tab [data-name="reportsList"]>li>a[data-toggle="tab"]': (event, template) => {
    template.report.set('reportName', $(event.target).data('report'))
    template.report.set('reportTemplate', false);
    template.report.set('reportData', false);
  },
  'click [data-name="createReport"]': (event, template) => {
    event.preventDefault();
    let report = template.report.get('reportName');
    Meteor.call(report, function (error, result) {
      if (error) {
        Bert.alert(error.reason, 'fixed-top', 'danger', 'fa-file-text-o')
      } else {
        template.report.set('reportTemplate', report);
        template.report.set('reportData', result);
      }
    })
  },
  'click [data-name="saveReport"]': (event, template) => {
    event.preventDefault();
    let report = template.report.get('reportName'),
      wb = {SheetNames: [], Sheets: {}};
    switch (report) {
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
        $('[data-name="reportData"]').find('.specialization a[data-toggle="tab"]').each(function () {
          wb.SheetNames.push($(this).text());
          let ws = XLSX.utils.table_to_sheet($($(this).attr('href')).find('table')[0], {dateNF: "dd.mm.yyyy"})
          wb.Sheets[$(this).text()] = ws;
        });
        break;
    }
    ;
    let wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: false, type: 'binary', cellDates: true, cellStyles: true});
    saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "report.xlsx");
  },
  'click #createQuery': (event) => {
    let renderers = $.extend(
      $.pivotUtilities.renderers,
      $.pivotUtilities.c3_renderers,
      $.pivotUtilities.d3_renderers,
      $.pivotUtilities.export_renderers
    );
    let dateFormat = $.pivotUtilities.derivers.dateFormat;
    event.preventDefault();
    let query = $('#builder').queryBuilder('getMongo');
    let res = Students.find(query);
    let zeroPad = function(number) {
      return ("0" + number).substr(-2, 2);
    };
    let hiddenAttr = ["_id", "id", "ind", "lastname", "firstname", "middlename",
      "spec", "course", "group", "birthday", "gender", "address", "parent", "createAt"];
    $("#pivot").pivotUI(res.fetch(), {
      hiddenAttributes: hiddenAttr,
      hiddenFromAggregators: hiddenAttr,
      derivedAttributes: {
        'ФИО': (item) => {
          return `${item.lastname} ${item.firstname} ${item.middlename}`;
        },
        'Группа': (item) => {
          return `${item.spec}-${item.course}${item.group}`;
        },
        'Специальность': (item) => {
          return item.spec;
        },
        'Номер курса': (item) => {
          return item.course;
        },
        'Дата создания анкеты': dateFormat("createAt", "%d.%m.%y"),
        'Дата рождения': dateFormat("birthday", "%d.%m.%y"),
        'Пол': (item) => {
          let gender = {'male': 'м', 'female': 'ж'};
          return gender[item.gender];
        },
        'Телефон': (item) => {
          return item.mobile||"";
        },
        'Email': (item) => {
          return item.email||"";
        },
        'ИНН': (item) => {
          return item.TIN||"";
        },
        'СНИЛС': (item) => {
          return item.SNILS||"";
        },
        'Тип документа': (item) => {
          let type = {"1": 'Паспорт гражданина РФ', "2": 'Паспорт иностранного гражданина'};
          return type[item.passport.type];
        },
        'Серия документа': (item) => {
          return item.passport.code;
        },
        'Номер документа': (item) => {
          return item.passport.number;
        },
        'Дата выдачи документа': (item) => {
          let date = item.passport.date;
          date = new Date(Date.parse(date));
          return `${zeroPad(date["getDate"]())}.${zeroPad(date["getMonth"]() + 1)}.${date["getFullYear"]()}`;
        },
        'Кем выдан документ': (item) => {
          return item.passport.department;
        },
        'Код подразделения': (item) => {
          return item.passport.departmentCode;
        },
        'Родитель1 (Роль)': (item) => {
          let role = {"mother":"Мать", "father":"Отец" ,"guardian":"Опекун"};
          if(item.parent) {
            return item.parent[0].role? role[item.parent[0].role]:"";
          }
          return "";
        },
        'Родитель1 (ФИО)': (item) => {
          if(item.parent) {
            return `${item.parent[0].firstname} ${item.parent[0].lastname} ${item.parent[0].middlename}`;
          }
          return "";
        },
        'Родитель1 (Место работы)': (item) => {
          if(item.parent) {
            return item.parent[0].work||"";
          }
          return "";
        },
        'Родитель1 (Должность)': (item) => {
          if(item.parent) {
            return item.parent[0].position||"";
          }
          return "";
        },
        'Родитель1 (Телефон)': (item) => {
          if(item.parent) {
            return item.parent[0].phone||"";
          }
          return "";
        },
        'Родитель2 (Роль)': (item) => {
          let role = {"mother":"Мать", "father":"Отец" ,"guardian":"Опекун"};
          if(item.parent && item.parent.length > 1) {
            return item.parent[1].role? role[item.parent[1].role]:"";
          }
          return "";
        },
        'Родитель2 (ФИО)': (item) => {
          if(item.parent && item.parent.length > 1) {
            return `${item.parent[1].firstname} ${item.parent[1].lastname} ${item.parent[1].middlename}`;
          }
          return "";
        },
        'Родитель2 (Место работы)': (item) => {
          if(item.parent && item.parent.length > 1) {
            return item.parent[1].work||"";
          }
          return "";
        },
        'Родитель2 (Должность)': (item) => {
          if(item.parent && item.parent.length > 1) {
            return item.parent[1].position||"";
          }
          return "";
        },
        'Родитель2 (Телефон)': (item) => {
          if(item.parent && item.parent.length > 1) {
            return item.parent[1].phone||"";
          }
          return "";
        },
        'Адрес Регистрации': (item) => {
          return `${item.address.registration.region}, ${item.address.registration.city}, ${item.address.registration.shf}`;
        },
        'Адрес Регистрации (Регион)': (item) => {
          return item.address.registration.region;
        },
        'Адрес Регистрации (Населенный пункт)': (item) => {
          return item.address.registration.city;
        },
        'Адрес Регистрации (Улица, Дом, Квартира)': (item) => {
          return item.address.registration.shf;
        },
        'Адрес Фактический': (item) => {
          return `${item.address.fact.region}, ${item.address.fact.city}, ${item.address.fact.shf}`;
        },
        'Адрес Фактический (Регион)': (item) => {
          return item.address.fact.region;
        },
        'Адрес Фактический (Населенный пункт)': (item) => {
          return item.address.fact.city;
        },
        'Адрес Фактический (Улица, Дом, Квартира)': (item) => {
          return item.address.fact.shf;
        },
        'Средний балл аттестата': (item) => {
          if(item.diploma) {
            return parseFloat(item.diploma.avr||0).toFixed(2).replace('.',',');
          }
          return "";
        },
        'Номер образовательной организации': (item) => {
          return item.school.number||"";
        },
        'Город образовательной организации': (item) => {
          return item.school.city||"";
        },
      },
      renderers: renderers
    }, true);
  }
});

function s2ab(s) {
  let buf = new ArrayBuffer(s.length),
    view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf
}