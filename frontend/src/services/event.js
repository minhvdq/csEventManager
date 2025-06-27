import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const eventUrl = `${backendBase}/api/events`

const getAll = async () => {
    const eventsObj = await axios.get(eventUrl)
    return eventsObj.data
}

export default {getAll}