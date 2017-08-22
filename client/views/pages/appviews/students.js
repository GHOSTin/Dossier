import {Students} from '/lib/collections/students'
import swal from 'sweetalert2'

import 'sweetalert2/dist/sweetalert2.min.css'

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
        FlowRouter.go('/student/'+$(event.currentTarget).data('user-id'))
    },
    'click .delete': ( event ) => {
        event.preventDefault();
        let id = $(event.currentTarget).data('user-id');
        swal({
            title: 'Вы уверены?',
            text: 'Вы не сможете вернуть изменения.',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dd6b55',
            confirmButtonClass: 'btn btn-primary',
            cancelButtonClass: 'btn btn-default',
            allowOutsideClick: false,
            confirmButtonText: 'Да, удалить!',
            cancelButtonText: 'Отменить'
        }).then(() => {
            Meteor.call('deleteStudent', id, function(error, response){
                if(error){
                    Bert.alert( error.reason, 'danger', 'fixed-top', 'fa-exclamation-triangle' );
                    return false;
                }
                Bert.alert('Удаление прошло успешно.', 'success', 'fixed-top', 'fa-trash-o')
            });
        })
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

