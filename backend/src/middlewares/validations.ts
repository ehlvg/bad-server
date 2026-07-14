import { Joi, celebrate } from 'celebrate'
import { Types } from 'mongoose'

// eslint-disable-next-line no-useless-escape
export const phoneRegExp = /^\+?[0-9 ()-]{7,20}$/

export enum PaymentType {
    Card = 'card',
    Online = 'online',
}

// валидация id
export const validateOrderBody = celebrate({
    body: Joi.object().keys({
        items: Joi.array().min(1).max(100)
            .items(
                Joi.string().custom((value, helpers) => {
                    if (Types.ObjectId.isValid(value)) {
                        return value
                    }
                    return helpers.message({ custom: 'Невалидный id' })
                })
            )
            .messages({
                'array.empty': 'Не указаны товары',
            }),
        payment: Joi.string()
            .valid(...Object.values(PaymentType))
            .required()
            .messages({
                'string.valid':
                    'Указано не валидное значение для способа оплаты, возможные значения - "card", "online"',
                'string.empty': 'Не указан способ оплаты',
            }),
        email: Joi.string().email().max(254).required().messages({
            'string.empty': 'Не указан email',
        }),
        phone: Joi.string().required().pattern(phoneRegExp).messages({
            'string.empty': 'Не указан телефон',
        }),
        address: Joi.string().trim().max(500).required().messages({
            'string.empty': 'Не указан адрес',
        }),
        total: Joi.number().min(0).max(100000000).required().messages({
            'string.empty': 'Не указана сумма заказа',
        }),
        comment: Joi.string().max(2000).optional().allow(''),
    }),
})

// валидация товара.
// name и link - обязательные поля, name - от 2 до 30 символов, link - валидный url
export const validateProductBody = celebrate({
    body: Joi.object().keys({
        title: Joi.string().required().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
            'string.empty': 'Поле "title" должно быть заполнено',
        }),
        image: Joi.object().keys({
            fileName: Joi.string().required(),
            originalName: Joi.string().required(),
        }),
        category: Joi.string().max(100).required().messages({
            'string.empty': 'Поле "category" должно быть заполнено',
        }),
        description: Joi.string().max(5000).required().messages({
            'string.empty': 'Поле "description" должно быть заполнено',
        }),
        price: Joi.number().allow(null),
    }),
})

export const validateProductUpdateBody = celebrate({
    body: Joi.object().keys({
        title: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        image: Joi.object().keys({
            fileName: Joi.string().max(255).pattern(/^\/images\/[a-f0-9-]+\.[a-z0-9]+$/i).required(),
            originalName: Joi.string().max(255).required(),
        }),
        category: Joi.string().max(100),
        description: Joi.string().max(5000),
        price: Joi.number().allow(null),
    }),
})

export const validateObjId = celebrate({
    params: Joi.object().keys({
        productId: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (Types.ObjectId.isValid(value)) {
                    return value
                }
                return helpers.message({ any: 'Невалидный id' })
            }),
    }),
})

export const validateUserBody = celebrate({
    body: Joi.object().keys({
        name: Joi.string().min(2).max(30).messages({
            'string.min': 'Минимальная длина поля "name" - 2',
            'string.max': 'Максимальная длина поля "name" - 30',
        }),
        password: Joi.string().min(6).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
        email: Joi.string()
            .required()
            .email()
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.empty': 'Поле "email" должно быть заполнено',
            }),
    }),
})

export const validateAuthentication = celebrate({
    body: Joi.object().keys({
        email: Joi.string()
            .required()
            .email()
            .message('Поле "email" должно быть валидным email-адресом')
            .messages({
                'string.required': 'Поле "email" должно быть заполнено',
            }),
        password: Joi.string().max(128).required().messages({
            'string.empty': 'Поле "password" должно быть заполнено',
        }),
    }),
})

export const validateUserUpdateBody = celebrate({
    body: Joi.object().keys({
        name: Joi.string().trim().min(2).max(30),
        phone: Joi.string().pattern(phoneRegExp).allow(''),
    }).min(1),
})

export const validateCustomerUpdate = celebrate({
    body: Joi.object().keys({
        name: Joi.string().trim().min(2).max(30),
        phone: Joi.string().pattern(phoneRegExp).allow(''),
        roles: Joi.array().items(Joi.string().valid('customer', 'admin')).min(1).max(2),
    }).min(1),
})

export const validateCustomerId = celebrate({
    params: Joi.object().keys({ id: Joi.string().hex().length(24).required() }),
})

export const validateOrderNumber = celebrate({
    params: Joi.object().keys({ orderNumber: Joi.number().integer().positive().required() }),
})

export const validateOrderId = celebrate({
    params: Joi.object().keys({ id: Joi.string().hex().length(24).required() }),
})

export const validateOrderUpdate = celebrate({
    body: Joi.object().keys({
        status: Joi.string().valid('cancelled', 'completed', 'new', 'delivering').required(),
    }),
})
