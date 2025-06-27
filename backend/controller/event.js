const eventRouter = require('express').Router()
const eventService = require('../service/eventService')
const {auth} = require('../utils/middlewares')
const multer = require("multer");
const upload = multer(); // or configure storage if needed

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
    console.log("Method:", req.method);
    console.log("Path:  ", req.originalUrl);
    console.log("Body:  ", req.body);       // ✅ now parsed
    console.log("File:  ", req.file);       // ✅ file object if uploaded

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
            startTime,
            endTime,
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
            start_time: startTime,
            end_time: endTime,
            need_resume: need_resume === "true",      // Convert strings to boolean
            need_major: need_major === "true",
            on_campus: on_campus === "true",
            is_colloquium: is_colloquium === "true",
            created_by: 1,
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