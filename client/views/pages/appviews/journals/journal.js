import {Students} from '/lib/collections/students'
import {ReactiveDict} from 'meteor/reactive-dict'

Template.journal.onCreated(function() {
  let self = this;
  self.filter = new ReactiveDict();
  self.filter.set('filterCriteria', false);
  self.filter.set('filterText', false);
  self.autorun(() => {
    self.sub = self.subscribe('students', null, {'filterCriteria': self.filter.get('filterCriteria'),'filterText': self.filter.get('filterText')});
  });
});

Template.journal.onRendered(function(){
  this.autorun(()=> {
    if (this.sub.ready()) {
      Tracker.afterFlush(() => {
        let data = Students.find({}).fetch().map((e)=>{
          return [`${e.lastname} ${e.firstname} ${e.middlename}`]
        });
        $('#list').jexcel({
          data: data,
          colHeaders: ['ФИО'],
          colWidths:[250],
          columns: [
            {type: 'text', readOnly: true, wordWrap: true}
          ]
        })
      })
    }
  })
});

Template.journal.events({
  'click #add': (event, template)=>{
    event.preventDefault();
    let lesson = $('#lesson').val();
    if(lesson) {
      $('#list').jexcel('insertColumn', 1, {header: lesson, width: '100'})
    }
  },
  'click #save': (event, template)=>{
    event.preventDefault();
    console.log($('#list').jexcel('getData', false));
  },
});