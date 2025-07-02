const studentRouter = require('express').Router()
const studentService = require('../service/studentService')

studentRouter.get('/', async (req, res) => {
    const students = await studentService.getAll()
    res.status(200).json(students)
})

studentRouter.get('/:email', async (req, res) => {
    try{
        const email = req.params.email
        const student = studentService.getStudentByEmail(email)
        if(student) {
            res.status(200).json({
                exist: true,
                student: student
            })
        }else{
            res.status(200).json({
                exist: false
            })
        }
    }catch(e) {
        json.status(400).json({error: "Something went wrong!"})
    }
})

studentRouter.post('/', async (req, res) => {
    const body = req.body
    try{
        const result = await studentService.createNewStudent(body)
        res.status(201).json(result)
    }catch(e){
        res.status(401).json({"error": e})
    }
})

