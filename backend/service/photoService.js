const Photo = require('../dataaccess/photo')

const getAllPhotos = async () => {
    const photos = await Photo.getAll();
    return photos;
}

const getPhotosByEventId = async (eventId) => {
    const photos = await Photo.getByEventId(eventId);
    const fixedPhotos = photos.map(photo => {
        const photoBuffer = photo.photo_data;
        const photoBase64 = photoBuffer.toString('base64');
        let photoData = `data:image/jpeg;base64,${photoBase64}`;
        return {...photo, photo_data: photoData}
    })
    return fixedPhotos;
}

const createPhoto = async (body) => {
    const photo = await Photo.create(body);
    return photo;
}

const createPhotos = async(photos) => {
    photos.map(async (photo) => {
        return await Photo.create(photo);
    })
}

const deletePhoto = async(id) => {  
    const photo = await Photo.deletePhoto(id);
    return photo;
}

module.exports = {
    getAllPhotos,
    getPhotosByEventId,
    createPhoto,
    createPhotos,
    deletePhoto
}