const eventRegisterRouter = require('express').Router()
const eventRegisterService = require('../service/eventRegisterService')
const multer = require('multer')

const storage = multer.memoryStorage()
const upload = multer.apply({storage: storage})

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

eventRegisterRouter.post('/newStudent', upload.single("resume"), async (req, res) => {
    try{
        const body = req.body
        const resumeTitle = req.file?.originalname || null
        const resume = req.file?.buffer || null

        const registerResponse = await eventRegisterService.registerWithNewStudent({...body, resumeTitle: resumeTitle, resume: resume})
        res.status(201).json(registerResponse)
        
    }catch(e) {
        res.status(400).json({error: e})
    }
})

eventRegisterRouter.post('/existingStudent', upload.single("resume"), async (req, res) => {
    try{
        const body = req.body
        const resumeTitle = req.file?.originalname || null
        const resume = req.file?.buffer

        const registerResponse = await eventRegisterService.registerWithExistingStudent({...body, resumeTitle: resumeTitle, resume: resume})
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