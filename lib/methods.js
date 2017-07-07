import { Accounts } from 'meteor/accounts-base';
import { Students } from '/lib/collections/students'

Meteor.methods({
    addUser: function(userAttributes) {
        check(Meteor.userId(), String);
        check(userAttributes, {
            name: String,
            username: String,
            email: String,
            password: String,
            password2: String,
            role: String,
            status: Match.Any,
        });
        if(Meteor.isServer) {
            let id;

            id = Accounts.createUser({
                password: userAttributes.password,
                username: userAttributes.username,
                email: userAttributes.email,
                profile: {
                    name: userAttributes.name,
                    status: userAttributes.status,
                    parentUser: (Roles.userIsInRole(Meteor.user(), "admin"))?"":Meteor.userId(),
                }
            });
            if (userAttributes.role.length > 0) {
                Roles.addUsersToRoles(id, userAttributes.role);
            }
            return {
                _id: id
            };
        }
    },
    editUser: function(userAttributes){
        check(Meteor.userId(), String);
        check(userAttributes, {
            name: String,
            username: String,
            role: String,
            email: String,
            password: String,
            password2: String,
            id: String,
            status: Match.Any,
        });
        Meteor.users.update(userAttributes.id, {
            $set: {
                "username": userAttributes.username,
                "profile.name": userAttributes.name,
                "email": userAttributes.email,
                "profile.status": userAttributes.status,
            }
        });
        if(Meteor.isServer) {
            if (!_.isEmpty(userAttributes.password2) && _.isEqual(userAttributes.password, userAttributes.password2)) {
                Accounts.setPassword(userAttributes.id, userAttributes.password);
            }
            Roles.setUserRoles(userAttributes.id, userAttributes.role);
        }
        return true;
    },
    parseUpload( data ){
        check(data, Array);
        _.each(data, function(value, key){
            value.name = value[0];
            value.speciality = value[1];
            value.year = value[2];
            delete value[0];
            delete value[1];
            delete value[2];
        });
        for (let i = 0; i< data.length; i++){
            let item = data[i],
                exists = Students.findOne({name: item.name});
            if(!exists) {
                Students.insert(item);
            } else {
                if(Meteor.isClient) {
                    console.warn(`Отклонено. Студент "${item.name}" уже добавлен`);
                }
            }
        }
    },
    addStudent( data ){
        check(Meteor.userId(), String);
        check(data, Object);
        let exists = Students.findOne({firstname: data.firstname, lastname: data.lastname, middlename: data.middlename, birthday: data.birthday});
        if(!exists) {
            Students.insert(data);
        } else {
            throw new Meteor.Error(403, `Отклонено. Студент "${data.lastname} ${data.firstname} ${data.middlename}" уже добавлен!`)
        }
        return true;
    },
    editStudent( data ){
        check(Meteor.userId(), String);
        check(data, Object);
        Students.update({_id: data.id}, {$set: data});
        return true;
    },
    dailyStatistic() {
        if(Meteor.isServer){
            return Students.aggregate([{$match:
                {role: "abiturient"}
            },{$group :
                {
                    _id: {
                        month: {$month: "$createAt"},
                        day:{$dayOfMonth: "$createAt"},
                        year: {$year: "$createAt"},
                        spec: "$spec",
                        date: {
                            $dateToString: {
                                format: "%d.%m.%Y",
                                date: "$createAt"
                            }
                        }
                    },
                    count: {
                        $sum: 1
                    },
                }
            }, {$project:
                {
                    _id: 0,
                    date: "$_id.date",
                    spec: "$_id.spec",
                    count: 1,
                }
            }, {$group :
                {
                    _id: "$date",
                    data: {
                        $push: {
                            spec: "$spec",
                            count: "$count",
                        }
                    },
                    totalCount: {$sum: "$count"}
                }
            }]);
        }
    },
    PRStatistics() {
        if(Meteor.isServer){
            let informers = Students.aggregate([{$match:
                {role: "abiturient"}
            },{ $unwind: "$informers" },{$group :
                {
                    _id: "$informers",
                    count: {
                        $sum: 1
                    },
                }
            }, {$sort: {_id: 1}}]);
            let choose = Students.aggregate([{$match:
                {role: "abiturient"}
            },{ $unwind: "$choose" },{$group :
                {
                    _id: "$choose",
                    count: {
                        $sum: 1
                    },
                }
            }, {$sort: {_id: 1}}]);
            return {"informers": informers, "choose": choose}
        }
    }
});