Template.specializationReport.onCreated( function() {
    this.groupCounter = new ReactiveVar(0);
});

Template.specializationReport.onRendered( function(){
    this.groupCounter.set(Template.instance().data[0].students.length)
})

Template.specializationReport.helpers({
    counter(){
        return Template.instance().groupCounter.get();
    },
    counterStr(collection){
        return 'Число заявок: '+collection.length;
    }
})

Template.specializationReport.events({
    'shown.bs.tab .specializationList a[data-toggle="tab"]':( event, template ) => {
        let group = $(event.target).data('group')||0;
        template.groupCounter.set(Template.instance().data[group].students.length)
    },
})