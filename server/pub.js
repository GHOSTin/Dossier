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

Meteor.publish('abiturients', function( search, filter ){
    check(search, Match.OneOf(String, null, undefined));

    let query = {role: "abiturient"},
        filterQuery = {},
        projection = {sort: {"ind": 1}};

    if (search) {
        let regex = new RegExp(search, 'i');

        let queryIds = Students.aggregate([
            {$project: {"username": { $concat : ["$lastname", " ", "$firstname", " ", "$middlename"]}, "indicator": {"$toLower": "$ind"}}},
            {$match: {$or: [{"indicator": regex}, {"username": regex}]}}
        ]).map(function(e){ return e._id});

        query = {_id: {$in: queryIds}, role: "abiturient"};
    }

    if(filter) {
        let filterText = new RegExp(filter.filterText, 'i');
        switch (filter.filterCriteria) {
            case 'parent.passport.code':
                filterQuery = {$or: [{"parent.0.passport.code": filterText}, {"parent.1.passport.code": filterText}]};
                break;
            case 'parent.passport.number':
                filterQuery = {$or: [{"parent.0.passport.number": filterText}, {"parent.1.passport.number": filterText}]};
                break;
            case 'parent.username':
                let queryIds = Students.aggregate([{
                    $project: {
                        "username1": {$concat: ["$parent.0.lastname"," ","$parent.0.firstname"," ","$parent.0.middlename"]},
                        "username2": {$concat: ["$parent.1.lastname"," ","$parent.1.firstname"," ","$parent.1.middlename"]}
                    }},{
                    $match: {$or: [{"username1": filterText},{"username2": filterText}]}}
                ]);
                filterQuery = {_id: {$in: queryIds}};
                break;
        }
        query = {$and: [query, filterQuery]};
    }
    return Students.find(query, projection);
});

Meteor.publish('students', function( search, filter ){
    check(search, Match.OneOf(String, null, undefined));

    let query = {role: "student"},
        filterQuery = {},
        projection = {sort: {"ind": 1}};

    if (search) {
        let regex = new RegExp(search, 'i');

        let queryIds = Students.aggregate([
            {$project: {"username": { $concat : ["$lastname", " ", "$firstname", " ", "$middlename"]}, "indicator": {"$toLower": "$ind"}}},
            {$match: {$or: [{"indicator": regex}, {"username": regex}]}}
        ]).map(function(e){ return e._id});

        query = {_id: {$in: queryIds}, role: "student"};
    }

    if(filter) {
        let filterText = new RegExp(filter.filterText, 'i');
        switch (filter.filterCriteria) {
            case 'parent.passport.code':
                filterQuery = {$or: [{"parent.0.passport.code": filterText}, {"parent.1.passport.code": filterText}]};
                break;
            case 'parent.passport.number':
                filterQuery = {$or: [{"parent.0.passport.number": filterText}, {"parent.1.passport.number": filterText}]};
                break;
            case 'parent.username':
                let queryIds = Students.aggregate([{
                    $project: {
                        "username1": {$concat: ["$parent.0.lastname"," ","$parent.0.firstname"," ","$parent.0.middlename"]},
                        "username2": {$concat: ["$parent.1.lastname"," ","$parent.1.firstname"," ","$parent.1.middlename"]}
                    }},{
                    $match: {$or: [{"username1": filterText},{"username2": filterText}]}}
                ]);
                filterQuery = {_id: {$in: queryIds}};
                break;
            case 'phone':
                filterQuery = {phone: filterText};
                break;
            case 'mobile':
                filterQuery = {mobile: filterText};
                break;
            case 'email':
                filterQuery = {email: filterText};
                break;
            case 'group':
                let [full, spec, course, group] = filter.filterText.split(/(\D{2,4})-(\d)(\d*)/gi);
                filterQuery = {$and: [{spec: spec}, {course: course}, {group: group}]};
                break;
        }
        query = {$and: [query, filterQuery]};
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