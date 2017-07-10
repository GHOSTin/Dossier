import {Students} from '/lib/collections/students'
import {Avatars} from '/lib/collections/avatars'

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

Meteor.publish('Meteor.user.rules', function () {
    const selector = {
        _id: this.userId
    };
    const options = {
        fields: { rules: 1 }
    };
    return Meteor.users.find(selector, options);
});

Meteor.publish('students', function( search ){
    check(search, Match.OneOf(String, null, undefined));

    let query = {},
        projection = {sort: {"ind": 1}};

    if (search) {
        let regex = new RegExp(search, 'i');

        let queryIds = Students.aggregate([
            {$project: {"username": { $concat : ["$lastname", " ", "$firstname", " ", "$middlename"]}, "indicator": {"$toLower": "$ind"}}},
            {$match: {$or: [{"indicator": regex}, {"username": regex}]}}
        ]).map(function(e){ return e._id});

        query = {_id: {$in: queryIds}};
    }
    return Students.find(query, projection);
});

Meteor.publish('student', function( id ){
    check(id, Match.OneOf(String, null, undefined));
    let query = {},
        projection = {sort: {"ind": 1}};
    if(id) {
        query = {_id: id}
    }
    return Students.find(query, projection);
});

Meteor.publish('avatar', function( id ){
    check(id, Match.OneOf(String, null, undefined));
    if(id) {
        return Avatars.findOne({_id: id});
    }
    return Avatars.find({});
});