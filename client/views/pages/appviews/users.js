Template.users.onCreated(function() {
    var self = this;
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