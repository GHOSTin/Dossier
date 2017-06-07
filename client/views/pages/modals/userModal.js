Template.userModal.onRendered(()=>{
    $('#role').select2({
        dropdownParent: $('#userModal'),
        theme: "bootstrap"
    })
});

Template.userModal.helpers({
    user: function() {
        let userId = Session.get('selectedUser');

        if (typeof userId !== "undefined") {
            return Meteor.users.findOne(userId);
        } else {
            return {username:'', profile:{name: ''}, roles: []}
        }
    },
});

Template.userModal.events({
    'click #save': function(e){
        e.preventDefault();
        let userId = Session.get('selectedUser'),
            user = {
                name: $('#name').val(),
                username: $('#username').val(),
                email: $('#email').val(),
                password: $('#password').val()||"",
                password2: $('#password2').val()||"",
                role: $('#role').val(),
                status: $('#status').is(':checked')?"active":"",
            };
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