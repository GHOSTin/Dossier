ModalHelper = {};

ModalHelper.openModalFor = function(userId) {
    if(Meteor.isClient) {
        Session.set('selectedUser', userId);
        Modal.show('userModal');
    }
};

Template.users.onCreated(function() {
    let self = this;
    self.searchQuery = new ReactiveVar();
    self.searching = new ReactiveVar(false);
    self.autorun(() => {
        self.subscribe('users', self.searchQuery.get(), ()=> {
            setTimeout(()=> {
                self.searching.set(false);
            }, 3000);
        });
    });
});

Template.users.helpers({
    users(){
        return Meteor.users.find()
    }
});

Template.users.events({
    'click #add': function(e, template){
        e.preventDefault();
        ModalHelper.openModalFor(null);
    },
    'click .edit': function (e) {
        e.preventDefault();
        let user = $(e.target).closest('.edit'),
            userId = user.attr('data-user-id');
        ModalHelper.openModalFor(userId);
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