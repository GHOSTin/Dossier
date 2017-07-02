var createThumb = function(fileObj, readStream, writeStream) {
    // Transform the image into a 10x10px thumbnail
    gm(readStream, fileObj.name()).resize('130').stream().pipe(writeStream);
};

var normalizeExt = function (fileObj) {
    return {
        extension: 'png',
        type: 'image/png'
    };
};

export const Avatars = new FS.Collection("avatars", {
    stores: [
        new FS.Store.FileSystem("thumbs", { /*transformWrite: createThumb,*/ beforeWrite: normalizeExt }),
        new FS.Store.FileSystem("images", { beforeWrite: normalizeExt }),
    ],
    filter: {
        allow: {
            contentTypes: ['image/*'] //allow only images in this FS.Collection
        }
    }
});