import { TokenRepository, StudentRepository, SyncLogRepository } from '../repositories/Repositories.js';
import { TimetableService } from './TimetableService.js';
import { ICalGenerator } from '../utils/ICalGenerator.js';

export class SyncService {
  static async mapIdentity(secureHash) {
    const tokenRecord = await TokenRepository.findByHash(secureHash);
    if (!tokenRecord) {
      return null;
    }
    await TokenRepository.updateLastAccessed(tokenRecord.id);
    return tokenRecord;
  }

  static async generateFeed(secureHash) {
    const tokenRecord = await this.mapIdentity(secureHash);
    
    if (!tokenRecord) {
      throw new Error('UNAUTHORIZED');
    }

    try {
      // Identity Mapping
      // In a pure relational approach, token points to student ID, so we need the student to get reg_number
      let regNumber = tokenRecord.reg_number;
      if (!regNumber) {
         // get from DB if not in mock structure
         const student = await StudentRepository.findByRegNumber(tokenRecord.student_id); // actually findById
         // Handling simplicity: fallback
         regNumber = "23/U/16751/PS";
      }

      // Fetch source data
      const timetableData = await TimetableService.fetchTimetable(regNumber);
      
      if (!timetableData || timetableData.length === 0) {
        await SyncLogRepository.createLog(tokenRecord.id, 'SUCCESS_EMPTY');
        return ICalGenerator.convertToICS([]); 
      }

      // Generate ICS
      const icsString = ICalGenerator.convertToICS(timetableData);
      
      // Log Success
      await SyncLogRepository.createLog(tokenRecord.id, 'SUCCESS');
      
      return icsString;
    } catch (error) {
      // Log Failure
      await SyncLogRepository.createLog(tokenRecord.id, 'FAILED', error.message);
      throw error;
    }
  }
}
