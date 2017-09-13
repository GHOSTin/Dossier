import {Students} from '/lib/collections/students'
import swal from 'sweetalert2'

import 'sweetalert2/dist/sweetalert2.min.css'

Template.abiturients.onCreated(function() {
    let self = this;
    self.searchQuery = new ReactiveVar();
    self.searching = new ReactiveVar(false);
    self.filter = new ReactiveDict();
    self.filter.set('filterCriteria', false);
    self.filter.set('filterText', false);
    self.autorun(() => {
        self.subscribe('abiturients', self.searchQuery.get(), {'filterCriteria': self.filter.get('filterCriteria'),'filterText': self.filter.get('filterText')}, ()=> {
            setTimeout(()=> {
                self.searching.set(false);
            }, 3000);
        });
    });
});

Template.abiturients.onRendered(()=>{

});


Template.abiturients.helpers({
    students(){
        return Students.find({},{sort: {createAt: 1}})
    },
    indicator(){
        return s.lpad(this.ind, 6, "0");
    }
});

Template.abiturients.events({
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
            template.filter.set('filterCriteria', $('#filterCriteria').val());
            template.filter.set('filterText', $('#filterText').val());
        }

        if( value === "" ) {
            template.searchQuery.set(value);
            template.filter.set('filterCriteria', $('#filterCriteria').val());
            template.filter.set('filterText', $('#filterText').val());
        }
    },
    'click #search': function(e, template){
        e.preventDefault();
        let value = $('#userName').val().trim();

        if(value !== ''){
            template.searchQuery.set(value);
            template.searching.set( true );
            template.filter.set('filterCriteria', $('#filterCriteria').val());
            template.filter.set('filterText', $('#filterText').val());
        }

        if( value === "" ) {
            template.searchQuery.set(value);
            template.filter.set('filterCriteria', $('#filterCriteria').val());
            template.filter.set('filterText', $('#filterText').val());
        }
    },
    'click #filter': function(e, template){
        e.preventDefault();
        $('#filterCriteria, #filterText').val("");
    }
});

