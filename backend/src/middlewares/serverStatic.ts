import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    const resolvedBaseDir = path.resolve(baseDir)
    return (req: Request, res: Response, next: NextFunction) => {
        let decodedPath: string
        try {
            decodedPath = decodeURIComponent(req.path)
        } catch (_error) {
            return next()
        }
        const filePath = path.resolve(resolvedBaseDir, `.${decodedPath}`)
        if (!filePath.startsWith(`${resolvedBaseDir}${path.sep}`)) return next()

        // Проверяем, существует ли файл
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // Файл не существует отдаем дальше мидлварам
                return next()
            }
            // Файл существует, отправляем его клиенту
            return res.sendFile(filePath, { dotfiles: 'deny', maxAge: '1h' }, (sendError) => {
                if (sendError) {
                    next(sendError)
                }
            })
        })
    }
}
