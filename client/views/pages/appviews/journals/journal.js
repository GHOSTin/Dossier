import {Meteor} from 'meteor/meteor'
import {Students, Groups, Journal, Disciplines} from '/lib/collections/students'
import {ReactiveDict} from 'meteor/reactive-dict'

let customEditor = {
  getValue: function (cell) {
    return $(cell).attr('uid');
  },
  setValue: function (cell, value) {
    if (value) {
      let data = Students.findOne({_id: value});
      $(cell).html(`${data.lastname} ${data.firstname} ${data.middlename}`);
      $(cell).attr('uid', value);
      return true;
    }
  }
};

let lessonEditor;
lessonEditor = {
  openEditor(cell) {
    let main = this;
    let input = $(cell).find('input');
    let html = null;
    if ($(input).length) {
      html = $(input).val();
    } else {
      html = $(input).html();
    }
    let editor = document.createElement('input');
    $(editor).prop('class', 'editor');
    $(editor).css('width', $(cell).width());
    $(editor).css('height', $(cell).height());
    $(cell).html(editor);
    $(editor).focus();
    if (html) {
      $(editor).val(html);
    }
    $(editor).blur(() => {
      main.closeEditor($(cell), true);
    });
  },
  closeEditor(cell) {
    return $(cell).find('.editor').val();
  },
  getValue: function (cell) {
    let id = $(cell).prop('id').split('-');
    let lessonId = $.fn.jexcel.defaults['list'].columns[id[0]].source;
    return {id: lessonId, value: $(cell).html()};
  },
  setValue: function (cell, value) {
    if("зачет".includes(value.toLowerCase()) && value){
      value = "зачет";
    }
    $(cell).html(value);
    return true;
  }
};

Template.journal.onCreated(function () {
  let self = this;
  self.filter = new ReactiveDict();
  self.filter.set('filterCriteria', false);
  self.filter.set('filterText', false);
  self.semester = new ReactiveVar("1");
  self.spec = new ReactiveVar(false);
  self.autorun(() => {
    self.sub = self.subscribe('students', null, {
      'filterCriteria': self.filter.get('filterCriteria'),
      'filterText': self.filter.get('filterText')
    }, self.semester.get());
    self.subscribe('students.groupList');
    self.disciplines = self.subscribe('disciplines', self.spec.get());
  });
});

Template.journal.onRendered(function () {
  $('#list').jexcel({
    data: [],
    colHeaders: ['ФИО'],
    colWidths: [250],
    columns: [
      {
        type: 'text',
        readOnly: true,
        wordWrap: true,
        editor: customEditor
      }
    ],
    allowInsertRow: false,
    allowManualInsertRow: false,
    allowManualInsertColumn: false,
    allowDeleteRow: false,
    columnSorting: false,
    about: false,
    contextMenu: (row, col) => {
      let contextMenuContent = '';
      if ($.fn.jexcel.defaults[$.fn.jexcel.current].allowDeleteColumn == true && col != 0) {
        contextMenuContent += "<a onclick=\"$('#" + $.fn.jexcel.current + "').jexcel('deleteColumn'," + col + ")\">Удалить предмет<span></span></a>";
      }
      return contextMenuContent;
    }
  });
  this.autorun(() => {
    if (this.sub.ready() && this.disciplines.ready()) {
      Tracker.afterFlush(() => {
        $('.chosen-select').chosen({width: "100%"});
        let data = Students.find({}, {sort: {lastname: 1, firstname: 1, middlename: 1}}).fetch().map((e) => {
          return [e._id]
        });
        let res = Journal.find({}, {$orderBy: {lessonId: 1}}).fetch();
        let columnIds = _.chain(res).pluck('lessonId').uniq();
        if (!$('#group').val() && !Meteor.user().group) {
          data = [];
          columnIds = [];
        } else {
          if(Meteor.user().group){
            let [, spec] = Meteor.user().group.split(/(\D+)-(\d+)/gi);
            this.spec.set(spec);
          }
        }
        for(let i = 0; i<$.fn.jexcel.defaults['list'].colHeaders.length; i++){
          if($.fn.jexcel.defaults['list'].colHeaders.length > 1) {
            $('#list').jexcel('deleteColumn', 1);
          }
        }
        columnIds.forEach((column)=>{
          let discipline = Disciplines.findOne({_id: column});
          $('#list').jexcel('insertColumn', 1, {
            header: discipline?discipline.name:column,
            width: '100',
            column: {
              type: 'text',
              source: column,
              editor: lessonEditor
            }
          })
        });
        data = data.map((elem)=>{
          let list = _.chain(res).where({uId: elem[0]}).pluck('point').value();
          return elem.concat(list);
        });
        $('#list').jexcel('setData', data);
        $('.chosen-select').trigger("chosen:updated");
      })
    }
  })
});

Template.journal.helpers({
  groups() {
    return Groups.find();
  },
  disciplines(){
    return Disciplines.find();
  }
});

Template.journal.events({
  'click #add': (event, template) => {
    event.preventDefault();
    let lessonId = $('#lesson').val();
    let lessonName = $('#lesson :selected').text()
    if (lessonId) {
      $('#list').jexcel('insertColumn', 1, {
        header: lessonName,
        width: '100',
        column: {
          type: 'text',
          source: lessonId,
          editor: lessonEditor
        }
      });
      $('#lesson').val('').trigger("chosen:updated");
    }
  },
  'click #save': (event, template) => {
    event.preventDefault();
    let semester = template.$('#semester').val();
    let data = $('#list').jexcel('getData', false);
    Meteor.call('journal.insert', semester, data, (res, error)=>{
      if(error){
        Bert.alert(error.reason, 'warning');
      }
    });
  },
  'change #group': (event, template) => {
    event.preventDefault();
    let group = $(event.target).val();
    if (group) {
      template.filter.set('filterCriteria', 'group');
      template.filter.set('filterText', group);
      let [, spec] = group.split(/(\D+)-(\d+)/gi)
      template.spec.set(spec);
    } else {
      template.filter.set('filterCriteria', false);
      template.filter.set('filterText', false);
      template.spec.set(false);
    }
  },
  'change #semester': (event, template)=> {
    event.preventDefault();
    template.semester.set( $('#semester').val() );
    $('#lesson').val('').trigger("chosen:updated");
  }
});