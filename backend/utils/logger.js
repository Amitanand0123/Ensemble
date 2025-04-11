import pino from 'pino'

const environment=process.env.NODE_ENV || 'development'
const isProduction=environment === 'production'

const options={
    level:process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    redact
}