const locationRouter = require('express').Router()
const locationService = require('../service/locationService')

locationRouter.get('/', async (req, res) => {
    try{
        const events = await locationService.getAll()
        res.status(200).json(events)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

module.exports = locationRouter