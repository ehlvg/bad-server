import crypto from 'crypto'
import { NextFunction, Request, Response } from 'express'
import BadRequestError from '../errors/bad-request-error'
import ForbiddenError from '../errors/forbidden-error'

const CSRF_COOKIE = '_csrf'
const CSRF_HEADER = 'x-csrf-token'
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export const issueCsrfToken = (_req: Request, res: Response) => {
    const token = crypto.randomBytes(32).toString('hex')
    res.cookie(CSRF_COOKIE, token, {
        httpOnly: false,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    })
    res.status(200).json({ csrfToken: token })
}

export const csrfProtection = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (SAFE_METHODS.has(req.method)) return next()

    const cookieToken = req.cookies?.[CSRF_COOKIE]
    const headerToken = req.header(CSRF_HEADER)
    if (
        !cookieToken ||
        !headerToken ||
        cookieToken.length !== headerToken.length ||
        !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
    ) {
        return next(new ForbiddenError('Невалидный CSRF-токен'))
    }
    return next()
}

const hasMongoOperator = (value: unknown): boolean => {
    if (Array.isArray(value)) return value.some(hasMongoOperator)
    if (!value || typeof value !== 'object') return false
    return Object.entries(value).some(
        ([key, nested]) =>
            key.startsWith('$') || key.includes('.') || hasMongoOperator(nested)
    )
}

export const rejectMongoOperators = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (hasMongoOperator(req.body) || hasMongoOperator(req.query)) {
        return next(new BadRequestError('Недопустимые параметры запроса'))
    }
    return next()
}
