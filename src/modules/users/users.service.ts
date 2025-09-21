import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
  ) {}

  async create(registerDto: RegisterDto): Promise<UserDocument> {
    const { email, password, name, school_id, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password only if it's not already a bcrypt hash
    // Bcrypt hashes typically start with "$2a$", "$2b$" or "$2y$" and are ~60 chars
    const isAlreadyHashed = typeof password === 'string' && password.startsWith('$2') && password.length >= 50;
    const hashedPassword = isAlreadyHashed ? password : await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      school_id,
      role: role || 'user',
    });

    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { last_login: new Date() });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findBySchoolId(schoolId: string): Promise<UserDocument[]> {
    return this.userModel.find({ school_id: schoolId }).exec();
  }
}
