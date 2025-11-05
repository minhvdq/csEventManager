const mailService = require('../utils/email/sendEmail')

const sendFeedback = async ({name, message}) => {
    try {
        mailService.sendEmail( "acm.gettysburg.edu@gmail.com", "Feedback For Event Hub", {name: name || "Anonymous", message: message}, "/templates/feedback.handlebars")
    } catch (error) {
        console.log("Error sending feedback: " + error)
        throw error
    }
}

module.exports = {
    sendFeedback
}