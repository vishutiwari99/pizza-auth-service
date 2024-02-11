import { NextFunction, Request, Response } from 'express';
import { TenantService } from '../services/TenantService';
import { CreateTenantRequest } from '../types';
import { Logger } from 'winston';
import createHttpError from 'http-errors';
import { validationResult } from 'express-validator';

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger,
  ) {}
  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const { name, address } = req.body;
    this.logger.debug('Request for creating a tenant', req.body);
    try {
      const tenant = await this.tenantService.create({ name, address });
      this.logger.info('Tenant has been created', { id: tenant.id });

      res.status(201).json({ id: tenant.id });
    } catch (error) {
      next(error);
      return;
    }
  }
  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, 'Invalid url param.'));
      return;
    }

    this.logger.debug('Request for updating a tenant', req.body);

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });

      this.logger.info('Tenant has been updated', { id: tenantId });

      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const tenant = await this.tenantService.get();
      res.status(200).json(tenant);
    } catch (error) {
      next(error);
      return;
    }
  }
}
