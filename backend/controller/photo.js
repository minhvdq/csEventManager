const photoRouter = require('express').Router();
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const photoService = require('../service/photoService');
const upload = require('multer')();

photoRouter.get('/', async (req, res) => {
    const photos = await photoService.getAllPhotos();
    res.json(photos);
})

photoRouter.get('/event/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const photos = await photoService.getPhotosByEventId(eventId);
    res.json(photos);
})

photoRouter.post('/', upload.array('photos', 5), async (req, res) => {
    const decodedToken = await jwt.decode(req.token, config.SECRET)

    if(!decodedToken){
        return res.status(400).json({error: "Unauthorized!"})
    }

    const captions = req.body.captions.split(",");
    if(!captions || captions.length == 0){
        throw new Error("Please upload files first")
    }
    let cnt = 0;
    console.log(JSON.stringify(captions))
    const photos = req.files.map(file => ({
        eventId: req.body.eventId,
        photoData: file.buffer,
        caption: captions[cnt++]
    }))
    // console.log(JSON.stringify(photos.map(photo => photo.caption)))
    try{
        const createdPhotos = await photoService.createPhotos(photos);
        res.json(createdPhotos);
    }catch(err){
        console.log(err)
        res.status(500).json({error: "Failed to upload photos"})
    }
    
})

photoRouter.delete('/:photoId', async (req, res) => {
    const decodedToken = await jwt.decode(req.token, config.SECRET)

    if(!decodedToken){
        return res.status(400).json({error: "Unauthorized!"})
    }

    const userId = decodedToken.id
    const photoId = req.params.photoId;
    const deletedPhoto = await photoService.deletePhoto(photoId);
    res.json(deletedPhoto);
})


module.exports = photoRouter;