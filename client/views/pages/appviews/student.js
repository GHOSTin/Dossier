require('jquery-serializejson');
import {Students} from '/lib/collections/students'
import {Avatars} from '/lib/collections/avatars'

Template.Student.onCreated(function() {
    let self = this;
    self.avatarId = new ReactiveVar();
    self.autorun(function() {
        let postId = FlowRouter.getParam('id');
        self.sub = self.subscribe('student', postId);
        self.subscribe('avatar', self.avatarId.get());
    });
    self.socialDocs = new ReactiveVar(false);
    self.sports = new ReactiveVar(false);
    self.creations = new ReactiveVar(false);
    self.hobbies = new ReactiveVar(false);
    self.debts = [];
    self.avgpoints = [];
});

Template.Student.helpers({
    indicator(){
        if(Template.instance().subscriptionsReady()) {
            let id = FlowRouter.getParam('id'), prevInd, ind;
            if (id) {
                ind = s.toNumber(Students.findOne({_id: id}, {fields: {ind: 1}, sort: {ind: 1}, limit: 1}).ind);
            } else {
                prevInd = Students.find({}, {fields:{ind:1}, sort: {createAt: -1}, limit: 1}).fetch();
                ind = (!_.isEmpty(prevInd))?s.toNumber(_.first(prevInd).ind) + 1 : 1;
            }
            return s.lpad(ind, 6, "0");
        }
    },
    student() {
        let id = FlowRouter.getParam('id');
        return Students.findOne({_id: id}) || {};
    },
    photo(){
        let studentId = FlowRouter.getParam('id'),
            id = Students.findOne({_id: studentId}).avatar.toString();
        if(Template.instance().avatarId.get()) {
            id = Template.instance().avatarId.get();
        }
        return Avatars.findOne({_id: id})
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
            });
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
        ignore: "",
        rules: {
            ind: {
                /*required: true,*/
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
            gender: {
                required: true
            },
            'school[name]': {
                required: true
            },
            'passport[code]': {
                required: true
            },
            'passport[number]': {
                required: true
            },
            'passport[department]': {
                required: true
            },
            'passport[date]': {
                required: true
            },
            'passport[departmentCode]': {
                required: true
            },
            /*'diploma[type]': {
                required: true
            },
            'diploma[code]': {
                required: true
            },
            'diploma[number]': {
                required: true
            },
            'school[year]': {
                required: true
            },
            'diploma[date]': {
                required: true
            },*/
            'address[registration][region]':"required",
            'address[registration][city]':"required",
            'address[registration][shf]':"required",
            'address[fact][region]':"required",
            'address[fact][city]':"required",
            'address[fact][shf]':"required",
        },
        messages: {
            ind: {
                required: "Индивидуальный номер обязателен к заполнению.",
            },
            firstname: {
                required: "Укажите имя.",
            },
            lastname: {
                required: "Укажите фамилию.",
            },
            middlename: {
                required: "Укажите отчество.",
            },
            birthday: {
                required: "Укажите дату рождения.",
            },
            gender: {
                required: "Укажите пол.",
            },
            'school[name]': {
                required: "Укажите полное наименование Образовательного учереждения."
            },
            'passport[code]': {
                required: "Укажите серию паспорта."
            },
            'passport[number]': {
                required: "Укажите номер паспорта."
            },
            'passport[department]': {
                required: "Укажите кем выдан паспорт."
            },
            'passport[date]': {
                required: "Укажите дату выдачи паспорта."
            },
            'passport[departmentCode]': {
                required: "Укажите код подразделения паспорта."
            },
            'diploma[type]': {
                required: "Укажите вид документа об образовании."
            },
            'diploma[code]': {
                required: "Укажите серию документа об образовании."
            },
            'diploma[number]': {
                required: "Укажите номер документа об образовании."
            },
            'school[year]': {
                required: "Укажите год окончания учебного учереждения."
            },
            'diploma[date]': {
                required: "Укажите дату получения документа об образовании."
            },
            'address[registration][region]':"Укажите регион в адресе регистрации",
            'address[registration][city]':"Укажите город в адресе регистрации",
            'address[registration][shf]':"Укажите улицу/дом/квартиру в адресе регистрации",
            'address[fact][region]':"Укажите регион в фактическом адресе проживания",
            'address[fact][city]':"Укажите город в фактическом адресе проживания",
            'address[fact][shf]':"Укажите улицу/дом/квартиру в фактическом адресе проживания",
        },
        errorContainer: $('#validation-errors'),
        errorLabelContainer: $('#validation-errors ul'),
        wrapper: 'li',
    });
});

Template.Student.events({
    'click #cancel':( event )=> {
        event.preventDefault();
        FlowRouter.go('/students')
    },
    'submit form': ( event, template ) => {
        event.preventDefault();
        event.stopPropagation();
        if(!$("#form").valid()){
            Bert.alert('Обнаружены ошибки в заполнении!', 'danger', 'fixed-top', 'fa-frown-o');
            return false;
        }
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
        data.ind = s.toNumber(data.ind);
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
                }
                if (result) {
                    Bert.alert( 'Редактирование прошло успешно!', 'success', 'fixed-top' );
                    $('tr.hidden, div[class*="Content"][class~="hidden"]').removeClass('hidden');
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
                    if(template.debts.length > 0) {
                        _.each(template.debts, ( view )=>{
                            Blaze.remove(view);
                        });
                        template.debts = [];
                    }
                    if(template.avgpoints.length > 0) {
                        _.each(template.avgpoints, ( view )=>{
                            Blaze.remove(view);
                        });
                        template.avgpoints = [];
                    }
                }
            });
            console.log(data);
        }
        return false;
    },
    'ifUnchecked [name="factAsRegistration"]': ( event ) => {
        event.preventDefault();
        $('[id^=addressFact]').each(function( index ){
            $(this).prop('readonly', false);
        });
        return true;
    },
    'ifChecked [name="factAsRegistration"]': ( event ) => {
        event.preventDefault();

        $('[id^=addressFact]').each(function( index ){
            $(this).prop('readonly', true);
            let linkSelector = $(this).attr("data-link"),
                linkValue = $(`#${linkSelector}`).val();
            $(this).val(linkValue);
        });
        return true;
    },
    'keyup [id^="addressRegistration"]': ( event ) => {
        event.preventDefault();

        if($('input[name="factAsRegistration"]').is(":checked")) {
            let linkName = $(event.target).attr('id'),
                linkValue = $(event.target).val();
            $('[data-link="'+ linkName +'"]').val(linkValue);
        }
        return true;
    },
    'click #socialDocAdd': ( event, template )=>{
        event.preventDefault();
        let length = $('.socialDocContent').length;
        template.socialDocs.set(Blaze.renderWithData(Template.SocialDoc, {index: length}, $('#socialDocContainer')[0]));
        return true;
    },
    'click #addSport': ( event, template )=>{
        event.preventDefault();
        let length = $('.sportContent').length;
        template.sports.set(Blaze.renderWithData(Template.Sport, {index: length}, $('#sportContainer')[0]));
        return true;
    },
    'click #addCreation': ( event, template )=>{
        event.preventDefault();
        let length = $('.creationContent').length;
        template.creations.set(Blaze.renderWithData(Template.creation, {index: length}, $('#creationContainer')[0]));
        return true;
    },
    'click #addHobby': ( event, template )=>{
        event.preventDefault();
        let length = $('.hobbiesContent').length;
        template.hobbies.set(Blaze.renderWithData(Template.hobby, {index: length}, $('#hobbiesContainer')[0]));
        return true;
    },
    'click #addDebt': ( event,template ) => {
        event.preventDefault();
        let data = {
            name: $('#debtName').val(),
            type: $('#debtType').val(),
            date: $('#debtDate').val()
        },
            index = $('#debtTable tbody').find('tr').length;
        $('#debtName').val("");
        $('#debtType').val("");
        $('#debtDate').val("");
        let view = Blaze.renderWithData(Template.academicDebt, {index: index, data: data}, $('#debtTable tbody')[0]);
        template.debts.push(view);
        return true;
    },
    'click #addAvgPoints': ( event,template ) => {
        event.preventDefault();
        let data = {
            number: $('#avgPointsNumber').val(),
            date: $('#avgPointsDate').val()
        },
            index = $('#avgPointsTable tbody').find('tr').length;
        $('#avgPointsNumber').val("");
        $('#avgPointsDate').val("");
        let view = Blaze.renderWithData(Template.avgPoints, {index: index, data: data}, $('#avgPointsTable tbody')[0]);
        template.avgpoints.push(view);
        return true;
    },
    'change input[name^="diploma[subject]"]': ( event, template ) => {
        event.preventDefault();
        let [count3, count4, count5] = [0,0,0];
        $('input[name^="diploma[subject]"]')
            .filter(function(){ return this.value })
            .each(function(elem){
                if($(this).val() == 3){
                    count3++;
                }
                if($(this).val() == 4){
                    count4++;
                }
                if($(this).val() == 5){
                    count5++;
                }
            });
        let avg = (3*count3+4*count4+5*count5)/(count3+count4+count5);
        $('#diplomaCounts3').val(count3);
        $('#diplomaCounts4').val(count4);
        $('#diplomaCounts5').val(count5);
        $('#diplomaAvr').val(avg);
    },
    'click .upload-avatar': ( event ) => {
        event.preventDefault();
        Modal.show('avatar');
    },
    'change input[name="avatar"]': (event, template) => {
        event.preventDefault();
        template.avatarId.set($(event.currentTarget).val());
    }
});