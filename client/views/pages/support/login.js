Template.login.events({
    'submit form': ( event ) => {
        event.preventDefault();
        let login = $('#login').val(),
            password = $('#password').val();
        Meteor.loginWithPassword(login, password, function(error){
            if(error) {
                Bert.alert(error.reason, 'fixed-top', 'danger', 'fa-user');
            }
        });
    }
});