const studentRouter = require('express').Router()
const studentService = require('../service/studentService')
const multer = require('multer')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const userService = require('../service/userService')

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

studentRouter.get('/', async (req, res) => {
    const students = await studentService.getAll()
    res.status(200).json(students)
})

studentRouter.get('/:email', async (req, res) => {
    try{
        const email = req.params.email
        const getStudentByEmailResponse = await studentService.getStudentByEmail(email)
        res.status(200).json(getStudentByEmailResponse)
    }catch(e) {
        json.status(400).json({error: "Something went wrong!"})
    }
})

studentRouter.post('/', upload.single('resume'), async (req, res) => {
    const body = req.body
    try{
        const resumeTitle = req.file?.originalname || null
        const resume = req.file?.buffer || null
        const result = await studentService.createNewStudent({...body, resumeTitle: resumeTitle, resume: resume})
        res.status(201).json(result)
    }catch(e){
        res.status(401).json({error: e})
    }
})


studentRouter.delete('/:id', async (req, res) => {
    const decodedToken = await jwt.decode(req.token, config.SECRET)

    if(!decodedToken){
        return res.status(400).json({error: "Invalid Token"})
    }

    const userId = decodedToken.id

    const user = await userService.getUserById(userId)

    if(!user){
        console.log("User does not exists")
        return res.status(400).json({error: "User does not exists"})
    }

    const id = req.params.id;
    try{
        studentService.deleteById(id);
        res.status(200).send(`Student with id ${id} is deleted successfully!`)
    }catch(e){
        res.status(400).json({message: e})
    }
})

module.exports = studentRouter

