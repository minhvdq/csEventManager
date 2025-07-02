const db = require('../utils/db')

const getAll = async () => {
    const [rows] = await db.query('SELECT * FROM students')
    return rows
}

const getSudentById = async (id) => {
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [id])
    return rows[0]
}

const getStudentByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM students WHERE school_email = ? LIMIT 1', [email])
    if(rows.length > 0){
        return rows[0]
    }else{
        return null
    }
    
}

const createNewStudent = async (body) => {
    const {
        schoolId,
        schoolEmail,
        firstName,
        lastName,
        classYear,
        taken216,
        resumeTitle,
        resume
    } = body

    const lastUpdate = Date.now()
    
    const [result] = await db.query(
        `INSERT INTO events (school_id, school_email, first_name, last_name, class_year, taken_216, last_update, resume_title, resume) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         [schoolId, schoolEmail, firstName, lastName, classYear, taken216, lastUpdate, resumeTitle, resume]
    )
    
    return result
}

module.exports = {getAll, getStudentByEmail, getSudentById, createNewStudent}
