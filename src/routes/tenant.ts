import express from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantService } from '../services/TenantService';
import { Tenant } from '../entity/Tenant';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { Roles } from '../constants';

const router = express.Router();
const tenantRepository = AppDataSource.getRepository(Tenant);
const tentantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tentantService, logger);

router.post('/', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  tenantController.create(req, res, next),
);
router.patch('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  tenantController.update(req, res, next),
);
router.get('/', (req, res, next) => tenantController.getAll(req, res, next));
router.get('/:id', authenticate, canAccess([Roles.ADMIN]), (req, res, next) =>
  tenantController.getOne(req, res, next),
);
router.delete(
  '/:id',
  authenticate,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.destroy(req, res, next),
);
export default router;
