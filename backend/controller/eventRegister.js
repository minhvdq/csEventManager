const eventRegisterRouter = require('express').Router()
const eventRegisterService = require('../service/eventRegisterService')
const multer = require('multer')

const storage = multer.memoryStorage()
// FIX: Correct multer initialization
const upload = multer({ storage: storage })

// ... (Your GET routes are okay here, but the service they call needs fixing)

eventRegisterRouter.get('/byEvent/:eventId', async (req, res) => {
    try{
        const eventId = req.params.eventId
        // FIX: Calling the correct service function
        const registrations = await eventRegisterService.getRegistrationsForEvent(eventId)
        res.status(200).json(registrations)
    }catch(e){
        res.status(400).json({error: e.message})
    }
})


eventRegisterRouter.post('/newStudent', upload.single("resume"), async (req, res) => {
    try{
        const body = req.body
        // FIX: Safely access file properties
        const resumeTitle = req.file?.originalname || body.resumeTitle || null
        const resume = req.file?.buffer || null

        const registerResponse = await eventRegisterService.registerWithNewStudent({...body, resumeTitle: resumeTitle, resume: resume})
        res.status(201).json(registerResponse)
        
    }catch(e) {
        // FIX: Send a proper error message instead of an empty object
        res.status(400).json({error: e.message || 'An unknown error occurred.'})
    }
})

eventRegisterRouter.post('/existingStudent', upload.single("resume"), async (req, res) => {
    try{
        const body = req.body
        const resumeTitle = req.file?.originalname || body.resumeTitle || null
        const resume = req.file?.buffer || null

        const registerResponse = await eventRegisterService.registerWithExistingStudent({...body, resumeTitle: resumeTitle, resume: resume})
        if(registerResponse == null) {
            // It's better to send a clear message in a JSON object
            res.status(200).json({ message: "Student already registered for this event." })
        }else{
            res.status(201).json(registerResponse)
        }
    }catch(e) {
        res.status(400).json({error: e.message || 'An unknown error occurred.'})
    }
})

module.exports = eventRegisterRouter