Template.navigation.rendered = function(){

    // Initialize metisMenu
    $('#side-menu').metisMenu();

};

Template.navigation.helpers({
    studentGroups(){

    }
});

// Used only on OffCanvas layout
Template.navigation.events({

    'click .close-canvas-menu' : function(){
        $('body').toggleClass("mini-navbar");
    },
    'click .logout': (event)=>{
        event.preventDefault();
        Meteor.logout();
    }

});