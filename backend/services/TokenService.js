import crypto from 'crypto';
import { TokenRepository, StudentRepository } from '../repositories/Repositories.js';

export class TokenService {
  static async getOrCreateFeedToken(regNumber) {
    // Check if token exists
    const existingToken = await TokenRepository.findByStudentRegNumber(regNumber);
    if (existingToken) {
      return existingToken.secure_hash;
    }

    // Map to student id
    const student = await StudentRepository.findByRegNumber(regNumber);
    if (!student) {
        throw new Error('Student not found or valid in system');
    }

    // Generate token
    const secureHash = crypto.randomBytes(32).toString('hex'); // 64 char string
    await TokenRepository.createToken(student.id, secureHash, regNumber);
    
    return secureHash;
  }
}
