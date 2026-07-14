import { NextFunction, Request, Response } from 'express'
import { unlink } from 'fs/promises'
import { constants } from 'http2'
import sharp from 'sharp'
import BadRequestError from '../errors/bad-request-error'

const MIN_FILE_SIZE = 2 * 1024

const removeRejectedFile = async (path: string) => {
    await unlink(path).catch(() => undefined)
}

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не загружен'))
    }
    try {
        if (req.file.size < MIN_FILE_SIZE) {
            await removeRejectedFile(req.file.path)
            return next(new BadRequestError('Файл слишком маленький'))
        }

        try {
            const metadata = await sharp(req.file.path).metadata()
            if (!metadata.width || !metadata.height || !metadata.format) {
                throw new Error('Некорректное изображение')
            }
        } catch (_error) {
            await removeRejectedFile(req.file.path)
            return next(new BadRequestError('Некорректное изображение'))
        }

        const fileName = process.env.UPLOAD_PATH
            ? `/${process.env.UPLOAD_PATH}/${req.file.filename}`
            : `/${req.file?.filename}`
        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName,
            originalName: req.file?.originalname,
        })
    } catch (error) {
        return next(error)
    }
}

export default {}
