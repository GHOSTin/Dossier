import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    if(Meteor.users.find({}).count() === 0) {
        let id = Accounts.createUser({
            password: 'Aa123456',
            username: 'admin',
            profile: { name: 'admin', status: 'active' },
        });
        Roles.addUsersToRoles(id, ["admin"]);
    }
});
