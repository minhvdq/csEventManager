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
        console.log("User does not exists")
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
            startTime,
            endTime,
            needResume,
            needMajor,
            onCampus,
            isColloquium,
            capacity,
            deadline
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
            startTime,
            endTime,
            needResume: needResume === "true",      // Convert strings to boolean
            needMajor: needMajor === "true",
            onCampus: onCampus === "true",
            isColloquium: isColloquium === "true",
            createdBy: userId,
            posterData: req.file?.buffer || null,
            capacity: capacity || null,
            deadline: deadline
        });
    
        res.status(201).json(event);
    } catch (error) {
        console.log("error: " + error.message)
        res.status(400).json({ message: error.message });
    }
});

eventRouter.put('/deadline/:id', async (req, res) => {
    try{
        const decodedToken = await jwt.decode(req.token, config.SECRET)

        if(!decodedToken){
            return res.status(400).json({error: "Invalid Token"})
        }

        const userId = decodedToken.id

        const user = await userService.getUserById(userId)

        if(!user){
            console.log("User does not exists")
            return res.status(400).json({error: "User does not exists"})
        }

        const { deadline } = req.body
        const { id } = req.params
        const response = await eventService.updateDeadline(deadline, id)
        res.status(200).json(response)
    }catch(error){
        console.log("error: " + error.message)
        res.status(400).json({message: error.message})
    }
})

eventRouter.delete('/:id', async (req, res) => {
    try{
        const decodedToken = await jwt.decode(req.token, config.SECRET)

        if(!decodedToken){
            console.log("Invalid Token")
            return res.status(400).json({error: "Invalid Token"})
        }

        const userId = decodedToken.id

        const user = await userService.getUserById(userId)

        if(!user){
            console.log("User does not exists")
            return res.status(400).json({error: "User does not exists"})
        }

        const { id } = req.params
        const response = await eventService.deleteEventById(id)
        res.status(200).json(response)
    }catch(error){
        console.log("error: " + error.message)
        res.status(400).json({message: error.message})
    }
})
  

module.exports = eventRouter