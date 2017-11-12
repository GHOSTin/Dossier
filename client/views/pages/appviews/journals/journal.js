import {Meteor} from 'meteor/meteor'
import {Students, Groups} from '/lib/collections/students'
import {ReactiveDict} from 'meteor/reactive-dict'

let customEditor = {
    getValue : function(cell) {
        return $(cell).attr('uid');
    },
    setValue : function(cell, value) {
        if(value) {
            value = JSON.parse(value)
            $(cell).html(value.name);
            $(cell).attr('uid', value.id);
            return true;
        }
    }
}

let lessonEditor = {
    getValue : function(cell) {
        console.log(cell)
        return $(cell).attr('uid');
    },
    setValue : function(cell, value) {
        if(value) {
            //value = JSON.parse(value)
            $(cell).html(value);
            $(cell).attr('uid', value);
            return true;
        }
    }
}

Template.journal.onCreated(function() {
  let self = this;
  self.filter = new ReactiveDict();
  self.filter.set('filterCriteria', false);
  self.filter.set('filterText', false);
  self.autorun(() => {
    self.sub = self.subscribe('students', null, {'filterCriteria': self.filter.get('filterCriteria'),'filterText': self.filter.get('filterText')});
    self.subscribe('students.groupList');
  });
});

Template.journal.onRendered(function(){
  $('#list').jexcel({
      data: [],
      colHeaders: ['ФИО'],
      colWidths:[250],
      columns: [
          {
              type: 'text',
              readOnly: true,
              wordWrap: true,
              editor:customEditor
          }
      ],
      allowInsertRow:false,
      allowManualInsertRow:false,
      allowManualInsertColumn:false,
      allowDeleteRow:false,
      columnSorting: false,
      about: false,
      contextMenu: (row,col)=>{
          let contextMenuContent = '';
          if ($.fn.jexcel.defaults[$.fn.jexcel.current].allowDeleteColumn == true && col != 0) {
              contextMenuContent += "<a onclick=\"$('#" + $.fn.jexcel.current + "').jexcel('deleteColumn'," + col + ")\">Удалить предмет<span></span></a>";
          }
          return contextMenuContent;
      },
      oninsertcolumn: (table)=>{
          let id = table.prop('id');
          let size = $.fn.jexcel.defaults[id].colHeaders.length;
          console.log(size)
          let lesson = $.fn.jexcel.defaults[id].columns[size-1].source;
          console.log(lesson)
      }
  })
  this.autorun(()=> {
    if (this.sub.ready()) {
      Tracker.afterFlush(() => {
        $('.chosen-select').chosen({width: "100%"});
        let data = Students.find({}, {sort:{lastname: 1, firstname: 1, middlename: 1}}).fetch().map((e) => {
          return [JSON.stringify({"id": e._id,"name": `${e.lastname} ${e.firstname} ${e.middlename}`})]
        });
        if(!$('#group').val() && !Meteor.user().group) {
            data = [];
        }
        $('#list').jexcel('setData', data)
      })
    }
  })
});

Template.journal.helpers({
    groups(){
        return Groups.find();
    }
})

Template.journal.events({
  'click #add': (event, template)=>{
    event.preventDefault();
    let lessonId = $('#lesson').val();
    let lessonName = $('#lesson :selected').text()
    if(lessonId) {
      $('#list').jexcel('insertColumn', 1, {
          header: lessonName,
          width: '100',
          column: {
              type: 'text',
              source: lessonId,
              editor: lessonEditor
          }
      })
      $('#lesson').val('').trigger("chosen:updated");
    }
  },
  'click #save': (event, template)=>{
    event.preventDefault();
    console.log($('#list').jexcel('getData', false));
  },
    'change #group': (event, template) =>{
      event.preventDefault();
      let group = $(event.target).val();
      let data = [];
      if (group){
          template.filter.set('filterCriteria', 'group');
          template.filter.set('filterText', group);
      } else {
          template.filter.set('filterCriteria', false);
          template.filter.set('filterText', false);
      }
    }
});