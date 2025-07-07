import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const eventUrl = `${backendBase}/api/students`

const getByEmail = async (email) => {
    const getByEmailResponse = await axios.get(`${eventUrl}/${email}`)
    return getByEmailResponse.data
}

export default {getByEmail}