const loginRouter = require('express').Router()
const loginService = require('../service/loginService')

loginRouter.post('/', async (req, res) => {
    try{
        const body = req.body
        const { token, email, isAdmin } = await loginService.login(body.email, body.password )
        res.status(201).json({ token, email, isAdmin })
    }catch(error){
        res.status(400).json({ message: error.message })
    }
})

module.exports = loginRouter