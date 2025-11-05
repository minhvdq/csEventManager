import axios from 'axios'
import {backendBase} from '../utils/homeUrl'

const sendFeedbackUrl = `${backendBase}/api/sendFeedback`
const sendFeedback = async ({name, message}) => {
    const response = await axios.post(sendFeedbackUrl, {name, message})
    return response.data
}

export default {sendFeedback}