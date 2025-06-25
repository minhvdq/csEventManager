const evemtRouter = require('express').Router()
const eventService = require('../service/eventService')

evemtRouter.get('/', async (req, res) => {
    const events = await eventService.getAllEvents()
    res.status(200).json(events)
})

eventRouter.post('/', async (req, res) => {
    const body = req.body
    try{
        const event = await eventService.createEvent(body)
        res.status(201).json(event)
    }catch(error){
        res.status(400).json({message: error.message})
    }
})


module.exports = evemtRouter