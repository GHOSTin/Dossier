import {Students} from '/lib/collections/students'

Meteor.publish('users', function (search) {
    check(search, Match.OneOf(String, null, undefined));

    let query = {},
        projection = {sort: {"profile.name": 1}};

    if (search) {
        let regex = new RegExp(search, 'i');

        query = {"profile.name": regex};
    }
    return Meteor.users.find(query, projection);
});

Meteor.publish('students', function( search ){
    check(search, Match.OneOf(String, null, undefined));

    let query = {},
        projection = {sort: {"name": 1}};

    if (search) {
        let regex = new RegExp(search, 'i');

        query = {"name": regex};
    }
    return Students.find(query, projection);
});