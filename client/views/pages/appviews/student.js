require('jquery-serializejson');
import {Students} from '/lib/collections/students'

Template.Student.onCreated(function() {
    var self = this;
    self.autorun(function() {
        var postId = FlowRouter.getParam('id');
        self.subscribe('student', postId);
    });
});

Template.Student.helpers({
    student() {
        let id = FlowRouter.getParam('id'),
            student = Students.findOne({_id: id}) || {};
        return student;
    }
});

Template.Student.rendered = function(){
    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
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
};

Template.Student.events({
    'submit form': ( event ) => {
        event.preventDefault();
        let data = $('#form').serializeJSON(),
            userId = Session.get('selectedUser');
        if (!userId) {
            Meteor.call('addStudent', data, function (error, result) {
                if (error) {
                    Bert.alert(error.reason, 'danger', 'fixed-top', 'fa-frown-o')
                } else {
                    Bert.alert( 'Добавление прошло успешно!', 'success', 'fixed-top' );
                    FlowRouter.go('/students');
                }
            });
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
    }
});