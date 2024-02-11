import { Repository } from 'typeorm';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';
import { UserData } from '../types';
import createHttpError from 'http-errors';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password, role }: UserData) {
    const user = await this.userRepository.findOne({ where: { email: email } });
    if (user) {
      const error = createHttpError(400, 'Email is already exists!');
      throw error;
    }
    // hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to store the data in the database',
      );
      throw error;
    }
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findAll() {
    return await this.userRepository.find();
  }
}
