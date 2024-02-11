import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';
import { Roles } from '../constants';

export class UserController {
  constructor(private userService: UserService) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;
    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });
      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
    }
  }
  async getUserList(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.findAll();
      res.status(200).json(users);
    } catch (error) {
      next(error);
      return;
    }
  }
}
