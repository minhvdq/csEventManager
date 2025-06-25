const evemtRouter = require('express').Router()

evemtRouter.get('/', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM events')
    res.json(rows)
})

eventRouter.post('/', async (req, res) => {
    
})

module.exports = evemtRouter