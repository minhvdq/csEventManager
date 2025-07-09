const backendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/eventHub' : '/eventHub'
const frontendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5173/eventHub' : '/eventHub'

module.exports = {backendBase, frontendBase}