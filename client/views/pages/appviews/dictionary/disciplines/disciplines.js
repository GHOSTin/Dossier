import {Meteor} from 'meteor/meteor'
import {Groups, Disciplines} from '/lib/collections/students'

Template.disciplines.onCreated(function(){
  this.spec = new ReactiveVar(false);
  this.autorun(() => {
    this.subscribe('disciplines', this.spec.get());
    this.subscribe('students.groupList');
  });
});

Template.disciplines.helpers({
  groups() {
    return Groups.find();
  },
  disciplines(){
    return Disciplines.find({},{sort: {"name": 1}});
  }
});

Template.disciplines.events({
  'input #spec': (event, template)=>{
    event.preventDefault();
    let spec = $(event.currentTarget).val();
    template.spec.set(spec);
  },
  'click #add': (event, template)=>{
    event.preventDefault();
    let spec = $('#spec').val(),
      discipline = $('#discipline').val(),
      disciplineId = $('#discipline').data('id');
    if(discipline){
      Meteor.call('disciplines', {spec, discipline:{id:disciplineId, name: discipline}}, (result, error)=>{
        $('#discipline').val('');
      })
    }
  },
  'click #edit': (event, template)=>{
    event.preventDefault();
    let discipline = Disciplines.findOne({_id: $(event.currentTarget).data('id')});
    $('#discipline').val(discipline.name).attr('id', discipline._id);
  }
});