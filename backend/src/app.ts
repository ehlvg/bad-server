import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'
import { rejectMongoOperators } from './middlewares/security'

const { PORT = 3000 } = process.env
const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(
    rateLimit({
        windowMs: 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { message: 'Слишком много запросов, попробуйте позже' },
    })
)
app.use(cookieParser())

const allowedOrigins = (process.env.ORIGIN_ALLOW || 'http://localhost')
    .split(',')
    .map((origin) => origin.trim())
app.use(cors({ origin: allowedOrigins, credentials: true }))

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(urlencoded({ extended: false, limit: '20kb' }))
app.use(json({ limit: '20kb' }))
app.use(rejectMongoOperators)

app.options('*', cors({ origin: allowedOrigins, credentials: true }))
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
