import {Avatars} from '/lib/collections/avatars';

Avatars.allow({
    'insert': function () {
        // add custom authentication code here
        return true;
    }
});