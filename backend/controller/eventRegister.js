const eventRegisterRouter = require('express').Router()
const eventAttendanceService = require('../service/eventAttendanceService')

eventRegisterRouter.post('/newUser', async(req, res) => {
    // const{
    //     schoolEmail,
    //     schoolId,
    //     firstName,
    //     lastName,
    //     classYear,
    //     taken216,
    //     lastUpdate,
    //     resumeTitle,
    //     resume
    // } = req.body

    const body = req.body

    try{
        const eventAttendanceResponse = await eventAttendanceService.registerNewStudent(body)
        res.status(200).json(eventAttendanceResponse)
    }catch(e){
        res.status(400).json({error: `Register for new user fail with error: ${e}`})
    }
})