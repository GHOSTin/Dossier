import {Students} from '/lib/collections/students'

Template.students.onCreated(function() {
    let self = this;
    self.searchQuery = new ReactiveVar();
    self.searching = new ReactiveVar(false);
    self.autorun(() => {
        self.subscribe('students', self.searchQuery.get(), ()=> {
            setTimeout(()=> {
                self.searching.set(false);
            }, 3000);
        });
    });
});


Template.students.helpers({
    students(){
        return Students.find({})
    }
});

