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

userRouter.get('/:email', async (req, res) => {
    email = req.params.email
    const user = await userService.getUserByEmail(email)
    res.status(200).json(user)
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

userRouter.delete('/:id', async (req, res) => {
    id = req.params.id
    userService.deleteUser(id)
    res.status(204).send(`Successfully Delete user with id ${id}`)
})

module.exports = userRouter