import {Students} from '/lib/collections/students'

Meteor.methods({

    'dailyStatistic': function() {
        if(Meteor.isServer){
            let webshot = require('webshot'),
                fs = require('fs');
                //Future = require('fibers/future');

            SSR.compileTemplate('reportLayout', Assets.getText('reportLayout.html'));

            Template.reportLayout.helpers({
                getDocType: function(){
                    return "<!DOCTYPE html>";
                }
            });

            SSR.compileTemplate('dailyStatisticReport', Assets.getText('dailyStatisticReport.html'));
            let data = Students.aggregate([{$group :
                {
                    _id: {
                        month: {$month: "$createAt"},
                        day:{$dayOfMonth: "$createAt"},
                        year: {$year: "$createAt"},
                        spec: "$spec"},
                    count: {
                        $sum: 1
                    }
                }
            }]);

            let html_string = SSR.render('reportLayout', {
                template: "dailyStatisticReport",
                data: data
            });

            console.log(html_string);
        }
    }

});