import { Accounts } from 'meteor/accounts-base';
import { Students, Journal, Disciplines } from '/lib/collections/students'

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
            rules: Match.Any,
            group: String
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
            Meteor.users.update(id, {
                $set: {
                    rules: userAttributes.rules,
                    group: userAttributes.group
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
            rules: Match.Any,
            group: String
        });
        Meteor.users.update(userAttributes.id, {
            $set: {
                "username": userAttributes.username,
                "profile.name": userAttributes.name,
                "email": userAttributes.email,
                "profile.status": userAttributes.status,
                "rules": userAttributes.rules,
                "group": userAttributes.group
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
    deleteStudent( id ){
        check(Meteor.userId(), String);
        check(id, String);
        let exists = Students.findOne({_id: id});
        if(exists.role !== 'abiturient'){
            throw new Meteor.Error(403, `Отклонено. Студент "${exists.lastname} ${exists.firstname} ${exists.middlename}" не является абитуриентом!`)
        }
        Students.remove({_id: id}, {justOne: true});
        return true;
    },
    dailyStatisticReport() {
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
    PRReport() {
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
    },
    specializationReport() {
        if(Meteor.isServer){
            return Students.aggregate([{$match:
                {role: "abiturient"}
            },{$project:
                {
                    "username": { $concat : ["$lastname", " ", "$firstname", " ", "$middlename"]},
                    "diploma.avr": 1,
                    "spec": 1,
                }
            },{$sort:
                {
                    "spec": -1,
                    "diploma.avr": -1
                }
            },{$group :
                {
                    _id: "$spec",
                    students:{
                        $push: {
                            fullname: "$username",
                            avgPoints: "$diploma.avr"
                        }
                    },
                }
            }]);
        }
    },
    KISReport(){
        if(Meteor.isServer) {
            return Students.aggregate([{
                $match: {role: "abiturient"}
            }, {
                $project: {
                    "username": {$concat: ["$lastname", " ", "$firstname", " ", "$middlename"]},
                    "passport.code": 1,
                    "passport.number": 1,
                    "passport.date": 1,
                    "passport.department": 1,
                    "birthday": 1,
                    "placeOfBirth": 1,
                    "address.registration.region": 1,
                    "address.registration.city": 1,
                    "address.registration.shf": 1,
                    "address.fact.region": 1,
                    "address.fact.city": 1,
                    "address.fact.shf": 1,
                    "SNILS": 1,
                    "TIN": 1,
                    "mobile": 1,
                    "spec": 1,
                }
            }, {
                $sort: {
                    "spec": -1,
                }
            }]);
        }
    },
    SchoolReport(){
        if(Meteor.isServer) {
            return Students.aggregate([
                {
                    $project: {
                        _id: {$concat: ["$school.city", " ", "$school.number"]},
                        "school.city": 1,
                        "school.number": 1,
                    }
                },
                {$group: {
                    _id: "$_id",
                    count: {$sum: 1},
                    "schoolCity": {$first: "$school.city"},
                    "schoolNumber": {$first: "$school.number"},
                    }
                },
                {
                    $project: {
                        "_id": 0,
                        "schoolCity": 1,
                        "schoolNumber": 1,
                        "count": 1
                    }
                },
                {
                    $sort: {
                        _id: 1,
                        count: -1
                    }
                }
            ]);
        }
    },
    hobbiesReport(){
        if(Meteor.isServer) {
            let sport = Students.find({sport: {$exists: true, $not: {$size: 0}}}).count();
            let creation = Students.find({creation: {$exists: true, $not: {$size: 0}}}).count();
            let hobbies = Students.find({hobbies: {$exists: true, $not: {$size: 0}}}).count();
            return {sport: sport, creation: creation, hobbies: hobbies}
        }
    },
    countByGroup(){
        if(Meteor.isServer){
            return Students.aggregate([{$match:
                {role: "abiturient"}
            }, {$group :
                {
                    _id: "$spec",
                    count:{
                        $sum: 1
                    },
                }
            }]);
        }
    },
  'journal.insert'(semester, data){
    data.forEach((elem)=>{
      let uId = elem.shift();
      Journal.remove({uId, semester});
      elem.forEach((elem)=>{
        Journal.insert({uId, semester, lessonId: elem.id, point: elem.value});
      })
    })
  },
  disciplines(data){
    let {spec, discipline} = data;
    if(discipline.id){
      Disciplines.update({_id: discipline.id}, {$set: {name: discipline.name, spec}})
    } else {
      Disciplines.insert({name: discipline.name, spec})
    }
  }
});