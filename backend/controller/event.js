const eventRouter = require('express').Router()
const eventService = require('../service/eventService')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const multer = require("multer");
const upload = multer(); // or configure storage if needed
const userService = require('../service/userService')

eventRouter.get('/', async (req, res) => {
    try{
        const events = await eventService.getAllEvents()
        res.status(200).json(events)
    }catch(error){
        res.status(500).json({message: error.message})
    }
    
})

eventRouter.post('/', upload.single('poster'), async (req, res) => {
    if (req.body.locationId === 'null') {
        req.body.locationId = null;
    }
    
    const decodedToken = await jwt.decode(req.token, config.SECRET)

    if(!decodedToken){
        return res.status(400).json({error: "Invalid Token"})
    }

    const userId = decodedToken.id

    const user = await userService.getUserById(userId)

    if(!user){
        return res.status(400).json({error: "User does not exists"})
    }

    try {
        const {
            name,
            description,
            locationId,
            locationName,
            address,
            lat,
            lng,
            room,
            start_time,
            end_time,
            need_resume,
            need_major,
            on_campus,
            is_colloquium,
            capacity
        } = req.body;
    
        const event = await eventService.createEvent({
            name,
            description,
            locationId,
            location: {
            name: locationName,
            address,
            lat,
            lng,
            room,
            },
            start_time: start_time,
            end_time: end_time,
            need_resume: need_resume === "true",      // Convert strings to boolean
            need_major: need_major === "true",
            on_campus: on_campus === "true",
            is_colloquium: is_colloquium === "true",
            created_by: userId,
            poster_data: req.file?.buffer || null,
            capacity: capacity || null,
        });
    
        res.status(201).json(event);
    } catch (error) {
        console.log("error: " + error.message)
        res.status(400).json({ message: error.message });
    }
});
  

module.exports = eventRouter