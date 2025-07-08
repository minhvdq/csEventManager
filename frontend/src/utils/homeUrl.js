export const backendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/eventHub' : '/eventHub'
export const frontendBase = process.env.NODE_ENV === 'development' ? 'http://localhost:5173/eventHub' : '/eventHub'

export default {backendBase, frontendBase}