FlowRouter.route('/login', {
    name: 'login',
    action: function() {
        BlazeLayout.render("blankLayout", {content: "login"});
    }
});

let loggedIn = FlowRouter.group({
    triggersEnter: [
        function(){
            if(!(Meteor.loggingIn() || Meteor.userId())) {
                let route = FlowRouter.current();

                if(route.route.name !== 'login'){
                    Session.set('redirectAfterLogin', route.path)
                }

                return FlowRouter.go('login')
            }
        }
    ]
});

let admin = loggedIn.group({
    triggersEnter: [
        function(){
            if(!Roles.userIsInRole(Meteor.user(), 'admin')){
                FlowRouter.go(FlowRouter.path('dashboard'))
            }
        }
    ]
});

loggedIn.route('/', {
    name: 'dashboard',
    action: function() {
        BlazeLayout.render("mainLayout", {content: "dashboard1"});
    }
});

loggedIn.route('/students', {
    action() {
        BlazeLayout.render("mainLayout", {content: "students"});
        Session.set('selectedUser', null);
    }
});

loggedIn.route('/student', {
    action() {
        BlazeLayout.render("mainLayout", {content: "Student"})
    }
});

loggedIn.route('/student/:id', {
    subscriptions(params){
        this.register('student', Meteor.subscribe('students', params.id))
    },
    action(params) {
        Session.set('selectedUser', params.id);
        BlazeLayout.render("mainLayout", {content: "Student"})
    }
});


admin.route('/users', {
    name: 'users',
    action() {
        BlazeLayout.render("mainLayout", {content: "users"})
    }
});

admin.route('/rules', {
    name: 'rules',
    action() {
        BlazeLayout.render("mainLayout", {content: "users"})
    }
});
FlowRouter.notFound = {
    action: function() {
        BlazeLayout.render("blankLayout", {content: "notFound"});
    }
};

