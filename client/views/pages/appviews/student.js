require('jquery-serializejson');
import {Students} from '/lib/collections/students'

Template.Student.onCreated(function() {
    var self = this;
    self.autorun(function() {
        var postId = FlowRouter.getParam('id');
        self.sub = self.subscribe('student', postId);
    });
    self.socialDocs = new ReactiveVar(false);
    self.sports = new ReactiveVar(false);
    self.creations = new ReactiveVar(false);
    self.hobbies = new ReactiveVar(false);
});

Template.Student.helpers({
    student() {
        let id = FlowRouter.getParam('id');
        return Students.findOne({_id: id}) || {};
    }
});

Template.Student.onRendered(function () {
    this.autorun(()=>{
        if(this.sub.ready()){
            Tracker.afterFlush(()=>{
                $('.i-checks').iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'iradio_square-green'
                });
                if($('input[name="factAsRegistration"]').is(":checked")) {
                    $('[id^=addressFact]').each(function( index ) {
                        $(this).prop('readonly', true);
                    });
                }
            })
        }
    });
    $('.input-group.date').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        autoclose: false,
        language: 'ru',
        format: "dd.mm.yyyy",
        weekStart: 1,
        calendarWeeks: false,
        todayHighlight: true
    });

    $("#form").validate({
        rules: {
            ind: {
                required: true,
                minlength: 3
            },
            firstname: {
                required: true
            },
            lastname: {
                required: true
            },
            middlename: {
                required: true
            },
            birthday: {
                required: true
            },
            'gender': {
                required: true
            }
        },
        messages: {
            ind: {
                required: "Индивидуальный номер обязателен к заполнению.",
            },
            firstname: {
                required: "Индивидуальный номер обязателен к заполнению.",
            },
            lastname: {
                required: "Индивидуальный номер обязателен к заполнению.",
            },
            middlename: {
                required: "Индивидуальный номер обязателен к заполнению.",
            },
            birthday: {
                required: "Индивидуальный номер обязателен к заполнению.",
            },
            'gender': {
                required: "Укажите пол.",
            },
        }
    });
});

Template.Student.events({
    'click #cancel':( event )=> {
        event.preventDefault();
        FlowRouter.go('/students')
    },
    'submit form': ( event, template ) => {
        event.preventDefault();
        let data = $('#form').find(':input').filter(function () {
            return $.trim(this.value).length > 0
        }).serializeJSON({
            customTypes: {
                date: function(str) {
                    return new Date(str);
                }
            }
        }),
            userId = Session.get('selectedUser');
        if (!userId) {
            _.extend(data, {createAt: new Date()});
            Meteor.call('addStudent', data, function (error, result) {
                if (error) {
                    Bert.alert(error.reason, 'danger', 'fixed-top', 'fa-frown-o')
                } else {
                    Bert.alert( 'Добавление прошло успешно!', 'success', 'fixed-top' );
                    FlowRouter.go('/students');
                }
            });
        } else {
            _.extend(data, {id: userId});
            Meteor.call('editStudent', data, function (error, result) {
                if (error) {
                    Bert.alert(error.reason, 'danger', 'fixed-top', 'fa-frown-o')
                } else {
                    Bert.alert( 'Редактирование прошло успешно!', 'success', 'fixed-top' );
                    if(template.socialDocs.get()) {
                        Blaze.remove(template.socialDocs.get());
                        template.socialDocs.set(false);
                    }
                    if(template.sports.get()) {
                        Blaze.remove(template.sports.get());
                        template.sports.set(false);
                    }
                    if(template.creations.get()) {
                        Blaze.remove(template.creations.get());
                        template.creations.set(false);
                    }
                    if(template.hobbies.get()) {
                        Blaze.remove(template.hobbies.get());
                        template.hobbies.set(false);
                    }
                }
            });
            console.log(data);
        }
    },
    'ifUnchecked [name="factAsRegistration"]': ( event ) => {
        event.preventDefault();
        $('[id^=addressFact]').each(function( index ){
            $(this).prop('readonly', false);
        })
    },
    'ifChecked [name="factAsRegistration"]': ( event ) => {
        event.preventDefault();

        $('[id^=addressFact]').each(function( index ){
            $(this).prop('readonly', true);
            let linkSelector = $(this).attr("data-link"),
                linkValue = $(`#${linkSelector}`).val();
            $(this).val(linkValue);
        });
    },
    'keyup [id^="addressRegistration"]': ( event ) => {
        event.preventDefault();

        if($('input[name="factAsRegistration"]').is(":checked")) {
            let linkName = $(event.target).attr('id'),
                linkValue = $(event.target).val();
            $('[data-link="'+ linkName +'"]').val(linkValue);
        }
    },
    'click #socialDocAdd': ( event, template )=>{
        event.preventDefault();
        if(!template.socialDocs.get()) {
            let length = $('.socialDocContent').length;
            template.socialDocs.set(Blaze.renderWithData(Template.SocialDoc, {index: length}, $('#socialDocContainer')[0]));
        }
    },
    'click #addSport': ( event, template )=>{
        event.preventDefault();
        if(!template.sports.get()) {
            let length = $('.sportContent').length;
            template.sports.set(Blaze.renderWithData(Template.Sport, {index: length}, $('#sportContainer')[0]));
        }
    },
    'click #addCreation': ( event, template )=>{
        event.preventDefault();
        if(!template.creations.get()) {
            let length = $('.creationContent').length;
            template.creations.set(Blaze.renderWithData(Template.Sport, {index: length}, $('#creationContainer')[0]));
        }
    },
    'click #addHobby': ( event, template )=>{
        event.preventDefault();
        if(!template.hobbies.get()) {
            let length = $('.hobbiesContent').length;
            template.hobbies.set(Blaze.renderWithData(Template.Sport, {index: length}, $('#hobbiesContainer')[0]));
        }
    }
});