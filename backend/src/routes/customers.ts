import { Router } from 'express'
import {
    deleteCustomer,
    getCustomerById,
    getCustomers,
    updateCustomer,
} from '../controllers/customers'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { Role } from '../models/user'
import { validateCustomerId, validateCustomerUpdate } from '../middlewares/validations'

const customerRouter = Router()

customerRouter.use(auth, roleGuardMiddleware(Role.Admin))
customerRouter.get('/', getCustomers)
customerRouter.get('/:id', validateCustomerId, getCustomerById)
customerRouter.patch('/:id', validateCustomerId, validateCustomerUpdate, updateCustomer)
customerRouter.delete('/:id', validateCustomerId, deleteCustomer)

export default customerRouter
