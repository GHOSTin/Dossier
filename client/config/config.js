Accounts.config({
    forbidClientAccountCreation: true,
});

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
});

Accounts.onLogin(()=>{
    let redirect = Session.get('redirectAfterLogin');

    Meteor.logoutOtherClients();
    Session.set('loggedIn', true);

    if(!_.isUndefined(redirect)){
        if(redirect !== '/login'){
            FlowRouter.go(redirect);
        }
    }
});

accountsUIBootstrap3.setLanguage('ru');