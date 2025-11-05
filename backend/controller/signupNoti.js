const signupNotiRouter = require('express').Router()
const signupNotiService = require('../service/signupNoti')

signupNotiRouter.post('/', async (req, res) => {
    const { email } = req.body
    try {
        await signupNotiService.signupWithEmail({email})
        res.status(200).json({ message: 'Signup notification sent successfully!' })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

signupNotiRouter.post('/checkStudentWithEmail', async (req, res) => {
    const { email, token } = req.body
    try {
        const student = await signupNotiService.checkStudentWithEmail({email, token})
        res.status(200).json(student)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

signupNotiRouter.post('/signupNoti', async (req, res) => {
    try {
        const studentId = await signupNotiService.singupNoti(req.body)
        res.status(200).json({message: 'Sign up successfully!'})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

signupNotiRouter.post('/signoutNoti', async (req, res) => {
    const { email, token } = req.body
    try {
        await signupNotiService.signoutNoti({email, token})
        res.status(200).json({message: 'Sign out successfully!'})
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = signupNotiRouter