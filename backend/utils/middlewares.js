const logger = require('./logger')
const jwt = require('jsonwebtoken')
const config = require('./config')
const userService = require('../service/userService')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else if( error.name === 'JsonWebTokenError'){
    return response.status(400).json({error: error.message})
  }
  else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)

}

const tokenExtractor = async ( request, response, next) => {
  const autho = request.get('authorization')
  if(autho && autho.startsWith('Bearer ')){
    console.log(autho)
    request.token = autho.replace('Bearer ', '')
  }
  next()

}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor
}