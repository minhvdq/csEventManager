const eventRegisterRouter = require('express').Router()
const eventRegisterService = require('../service/eventRegisterService')

eventRegisterRouter.get('/', async (req, res) => {
    try{
        const registrations = await eventRegisterService.getAllRegistrations()
        res.status(200).json(registrations)
    }catch(e){
        res.status(400).json({error: e})
    }
})

eventRegisterRouter.get('/byStudent/:studentId', async (req, res) => {
    try{
        const studentId = req.params.studentId
        const registrations = await eventRegisterService.getRegistrationsForStudent(studentId)
        res.status(200).json(registrations)
    }catch(e){
        res.status(400).json({error: e})
    }
})

eventRegisterRouter.get('/byEvent/:eventId', async (req, res) => {
    try{
        const eventId = req.params.eventId
        const registrations = await eventRegisterService.getRegistrationsForStudent(eventId)
        res.status(200).json(registrations)
    }catch(e){
        res.status(400).json({error: e})
    }
})

eventRegisterRouter.post('/newStudent', async (req, res) => {
    try{
        const body = req.body
        const registerResponse = await eventRegisterService.registerWithNewStudent(body)
        if(registerResponse == null) {
            res.status(200).send("Student already registered!")
        }else{
            res.status(201).json(registerResponse)
        }
        
    }catch(e) {
        res.status(400).json({error: e})
    }
})

eventRegisterRouter.post('/existingStudent', async (req, res) => {
    try{
        const body = req.body
        const registerResponse = await eventRegisterService.registerWithExistingStudent(body)
        if(registerResponse == null) {
            res.status(200).send("Student already registered!")
        }else{
            res.status(201).json(registerResponse)
        }
    }catch(e) {
        res.status(400).json({error: e})
    }
})

module.exports = eventRegisterRouter