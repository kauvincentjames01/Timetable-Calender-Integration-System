import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';

export class AuthController {
  
  static async signup(req, res, next) {
    try {
      const { student_number, staff_id, name, password, role } = req.body;

      // Default role to student if not provided, else restrict to student/admin
      const userRole = (role && role === 'admin') ? 'admin' : 'student';
      const identifier = userRole === 'admin' ? staff_id : student_number;

      if (!identifier || !password) {
        return res.status(400).json({ error: `${userRole === 'admin' ? 'Staff ID' : 'Student number'} and password are required` });
      }

      if (userRole === 'admin' && !name) {
        return res.status(400).json({ error: 'Name is required for administrators' });
      }

      const existingUser = await UserRepository.findByStudentNumber(identifier);
      if (existingUser) {
        return res.status(409).json({ error: `User with this ${userRole === 'admin' ? 'staff ID' : 'student number'} already exists` });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await UserRepository.createUser(identifier, passwordHash, userRole, name);

      // Generate token immediately on signup if desired, but we can just return success
      return res.status(201).json({ 
        message: 'User created successfully',
        user: { id: newUser.id, identifier: newUser.student_number, role: newUser.role, name: newUser.name }
      });

    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { student_number, staff_id, password } = req.body;
      const identifier = student_number || staff_id;

      if (!identifier || !password) {
        return res.status(400).json({ error: 'Student number/Staff ID and password are required' });
      }

      const user = await UserRepository.findByStudentNumber(identifier);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const secret = process.env.JWT_SECRET || 'fallback_preview_secret_do_not_use_in_prod';
      
      const payload = {
        userId: user.id,
        identifier: user.student_number,
        student_number: user.student_number, // for backward compatibility
        role: user.role,
        name: user.name
      };

      const token = jwt.sign(payload, secret, { expiresIn: '1d' });

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: payload
      });
      
    } catch (error) {
      next(error);
    }
  }
}
