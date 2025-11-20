const db = require('../utils/db')

const getAll = async () => {
    const [rows] = await db.query(`SELECT * FROM students`)
    return rows
}

const getByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM students WHERE school_email = ?', [email])
    if(!rows || rows.length < 1){
        return null
    }
    return rows[0]
}

const getById = async (id) => {
    const [rows] = await db.query('SELECT * FROM students WHERE id = ?', [id])
    return rows[0]
}

const create = async (body) => {
    const{
        schoolEmail,
        schoolId,
        firstName,
        lastName,
        classYear,
        taken216,
        lastUpdate,
        resumeTitle,
        resume
    } = body

    const [createResponse] = await db.query(`INSERT INTO students (school_email, school_id, first_name, last_name, class_year, taken_216, last_update, resume_title, resume) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        schoolEmail,
        schoolId,
        firstName,
        lastName,
        classYear,
        taken216,
        lastUpdate,
        resumeTitle,
        resume
    ])
    return createResponse
}

const updateMajorStatus = async (studentId, taken216) => {
    if(taken216 == null){
        throw new Error("Missing data")
    }

    const now = Date.now()

    const [updateResponse] = await db.query(`UPDATE students SET taken_216 = ?, last_update = ? WHERE id = ?`, [taken216, now, studentId])
    return updateResponse
}

const updateResume = async (studentId, resumeTitle, resume) => {
    if(!resumeTitle || !resume){
        throw new Error("Missing data")
    }
    const [updateRespone] = await db.query(`UPDATE students SET resume_title = ?, resume = ? WHERE id = ?`, [resumeTitle, resume, studentId])
    return updateRespone
}

const deleteByEmail = async (email) => {
    const [deleteResponse] = await db.query(`DELETE FROM students WHERE school_email = ?`, [email])
    return deleteResponse
}

const deleteById = async (id) => {
    const [deleteResponse] = await db.query(`DELETE FROM students WHERE id = ?`, [id])
    return deleteResponse
}

module.exports = {
    getAll,
    getById,
    getByEmail,
    create,
    updateMajorStatus,
    updateResume,
    deleteByEmail,
    deleteById
}