const userRouter = require('express').Router()
const userService = require('../service/userService')

userRouter.get('/', async (req, res) => {
    try{
        const users = await userService.getAllUsers()
        res.status(200).json(users)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

userRouter.post('/', async (req, res) => {
    const body = req.body
    try{
        const user = await userService.createUser(body)
        res.status(201).json(user)
    }catch(error){
        res.status(400).json({message: error.message})
    }
})

module.exports = userRouter