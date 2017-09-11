import {Students} from '/lib/collections/students'

Template.SchoolReport.onCreated(function () {
    let self = this;
    self.autorun(function() {
        self.subscribe('students');
    });
});