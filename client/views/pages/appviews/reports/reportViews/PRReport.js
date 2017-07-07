Template.PRReport.helpers({
    getCount(list, id){
        console.log(_.findWhere(list, {_id: id.toString()}));
        if (_.isUndefined(_.findWhere(list, {_id: id.toString()}))) {
            return 0
        }
        return _.findWhere(list, {_id: id.toString()}).count;
    }
})