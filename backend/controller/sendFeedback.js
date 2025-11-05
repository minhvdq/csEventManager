const sendFeedbackRouter = require('express').Router()
const sendFeedbackService = require('../service/sendFeedback')

sendFeedbackRouter.post('/', async (req, res) => {
    const {name, message} = req.body
    try {
        await sendFeedbackService.sendFeedback({name, message})
        res.status(200).json({message: 'Feedback sent successfully!'})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

module.exports = sendFeedbackRouter