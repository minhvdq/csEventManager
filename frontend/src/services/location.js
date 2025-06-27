import axios from 'axios'
import { backendBase } from '../utils/homeUrl'

const eventUrl = `${backendBase}/api/locations`

const getAll = async () => {
    const locationsObj = await axios.get(eventUrl)
    return locationsObj.data
}

export default {getAll}