import {Students} from '/lib/collections/students'

Template.KISReport.onCreated(function () {
    let self = this;
    self.autorun(function() {
        self.subscribe('students');
    });
});

Template.KISReport.helpers({
    getCount(list, id){
        if (_.isUndefined(_.findWhere(list, {_id: id.toString()}))) {
            return 0
        }
        return _.findWhere(list, {_id: id.toString()}).count;
    },
    getTotalCount(){
        return Students.find({role: "abiturient"}).count()
    }
})