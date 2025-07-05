const locationRouter = require('express').Router()
const Location = require('../dataaccess/location')

locationRouter.get('/', async (req, res) => {
    try{
        const events = await Location.getAll()
        res.status(200).json(events)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

module.exports = locationRouter 