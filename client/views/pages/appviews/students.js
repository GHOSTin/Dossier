import {Students} from '/lib/collections/students'

Template.students.onCreated(function() {
    let self = this;
    self.searchQuery = new ReactiveVar();
    self.searching = new ReactiveVar(false);
    self.autorun(() => {
        self.subscribe('students', self.searchQuery.get(), ()=> {
            setTimeout(()=> {
                self.searching.set(false);
            }, 3000);
        });
    });
});

Template.students.onRendered(()=>{

});


Template.students.helpers({
    students(){
        return Students.find({},{sort: {createAt: 1}})
    },
    indicator(){
        return s.lpad(this.ind, 6, "0");
    }
});

Template.students.events({
    'click .edit': ( event ) => {
        event.preventDefault();
        FlowRouter.go('/student/'+$(event.currentTarget).attr('data-user-id'))
    },
    'keyup #userName': function(e, template) {
        let value = $('#userName').val().trim();

        if(value !== '' && e.keyCode === 13 ){
            template.searchQuery.set(value);
            template.searching.set( true );
        }

        if( value === "" ) {
            template.searchQuery.set(value);
        }
    },
    'click #search': function(e, template){
        e.preventDefault();
        let value = $('#userName').val().trim();

        if(value !== ''){
            template.searchQuery.set(value);
            template.searching.set( true );
        }

        if( value === "" ) {
            template.searchQuery.set(value);
        }
    }
});

