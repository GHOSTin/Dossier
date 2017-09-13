Template.userModal.onRendered(function(){
    /*$('#role').select2({
        dropdownParent: $('#userModal'),
        theme: "bootstrap"
    });*/
    $('.client-detail').slimscroll({
        height: '100%'
    });
    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    });
});

Template.userModal.helpers({
    user() {
        let userId = Session.get('selectedUser');

        if (typeof userId !== "undefined") {
            return Meteor.users.findOne(userId);
        } else {
            return {username:'', profile:{name: ''}, roles: []}
        }
    },
    roles() {
        return Roles.getAllRoles();
    }
});

Template.userModal.events({
    'click #save': function(e){
        e.preventDefault();
        let user = $('#form').find(':input').serializeJSON({
                checkboxUncheckedValue: false,
                parseBooleans: true,
                customTypes: {
                    date: function(str) {
                        return new Date(str);
                    }
                }
            }),
            userId = Session.get('selectedUser');
        _.extend(user, {status: $('#status').is(':checked')?"active":""});
        if (!userId) {
            Meteor.call('addUser', user, function (error, result) {
                if (error) {
                    console.log(error);
                }
            });
        } else {
            _.extend(user, {id: userId});
            Meteor.call('editUser', user, function(error, result){
                if (error) {
                    console.log(error);
                }
            });
        }

        Modal.hide('userModal');
    },
    'change select#role': (e) => {
        if($(e.target).val() === "master") {

        }
    }
});