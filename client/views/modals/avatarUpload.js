import {Avatars} from '/lib/collections/avatars';

Template.avatar.rendered = function(){
    var $image = $(".image-crop > img")
    $($image).cropper({
        viewMode: 2,
        aspectRatio: 1,
        preview: ".img-preview"
    });
}

Template.avatar.events({
    'change :file': ( event ) => {
        var $image = $(".image-crop > img"),
            $inputImage = $("#inputImage"),
            fileReader = new FileReader(),
            files = this.event.target.files,
            file;

        if (!files.length) {
            return;
        }

        file = files[0];

        if (/^image\/\w+$/.test(file.type)) {
            fileReader.readAsDataURL(file);
            fileReader.onload = function () {
                $('.ownere-photo-step-2').toggleClass('hidden');
                $('.ownere-photo-step-1').toggleClass('hidden');
                $inputImage.val("");
                $image.cropper("reset", true).cropper("replace", this.result);
            };
        } else {
            Bert.alert('Выберите файл изображения!','fixed-top','danger', 'fa-warning');
        }
    },
    'click #owner-photo-upload-return': (event) => {
        $('.ownere-photo-step-2').toggleClass('hidden');
        $('.ownere-photo-step-1').toggleClass('hidden');
    },
    'click #owner-photo-save': (event, template) => {
        let cropImage = $(".image-crop > img").cropper('getCroppedCanvas').toDataURL('image/png'),
            fileObj = new FS.File(cropImage);
        fileObj.name(Session.get('selectedUser'));
        Avatars.insert(fileObj, function (err, fileObj){
            if (err){
                Bert.alert("Загрузка не удалась... Попробуйте еще раз.",'growl-top-right','danger', 'fa-warning');
            } else {
                Bert.alert("Загрузка прошла успешно.", 'growl-top-right', 'success', 'fa-check');
                setTimeout(function() {
                    $(".image-crop > img").cropper('clear');
                    $('input[name="avatar"]').val(fileObj._id);
                    Modal.hide('avatar');
                }, 500);
            }
        });
    }
})