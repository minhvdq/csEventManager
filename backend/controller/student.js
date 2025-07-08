const studentRouter = require('express').Router()
const studentService = require('../service/studentService')
const multer = require('multer')

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

module.exports = studentRouter

