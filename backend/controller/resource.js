const resourceRouter = require('express').Router()
const resourceService = require('../service/resource')
const userService = require('../service/userService')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

resourceRouter.get('/', async (req, res) => {
    const resources = await resourceService.getAll()
    res.json(resources)
})

resourceRouter.get('/event/:eventId', async (req, res) => {
    const eventId = req.params.eventId
    const resources = await resourceService.getByEventId(eventId)
    res.json(resources)
})


resourceRouter.post('/', async (req, res) => {
    const decodedToken = await jwt.decode(req.token, config.SECRET)

    if(!decodedToken){
        return res.status(400).json({error: "Unauthorized!"})
    }

    const user = await userService.getUserById(decodedToken.id)

    if(!user){
        return res.status(400).json({error: "Unauthorized!"})
    }

    const resourceResponse = await resourceService.create(req.body)
    res.json(resourceResponse)
})

resourceRouter.delete('/:id', async (req, res) => {
    const decodedToken = await jwt.decode(req.token, config.SECRET)

    if(!decodedToken){
        return res.status(400).json({error: "Unauthorized!"})
    }

    const user = await userService.getUserById(decodedToken.id)

    if(!user){
        return res.status(400).json({error: "Unauthorized!"})
    }

    const resourceResponse = await resourceService.deleteResource(req.params.id)
    res.json(resourceResponse)
})

module.exports = resourceRouter