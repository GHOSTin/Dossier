Tracker.autorun(()=>{
    if (!Meteor.userId()) {
        if (Session.get('loggedIn')) {
            let route = FlowRouter.current();
            Session.set('redirectAfterLogin', route.path);

            FlowRouter.go(FlowRouter.path('login'));
        }
    }
})