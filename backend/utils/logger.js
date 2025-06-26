const info = (...params) => {
    console.log(...params)
}

const error = (...mess) => {
    console.log(...mess)
}

module.exports = {info, error}