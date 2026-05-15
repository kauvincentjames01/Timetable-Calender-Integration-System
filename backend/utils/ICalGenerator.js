export class ICalGenerator {
  static convertToICS(timetableData) {
    // Ensure times are UTC and formatted strictly to YYYYMMDDTHHmmssZ
    const formatTime = (isoString) => {
      const d = new Date(isoString);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Get the most recent event timestamp for LAST-MODIFIED
    const lastModified = timetableData.length > 0
      ? new Date(Math.max(...timetableData.map(e => new Date(e.start_time).getTime()))).toISOString()
      : new Date().toISOString();

    const header = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Makerere//Timetable Sync//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `LAST-MODIFIED:${formatTime(lastModified)}`,
      'X-MICROSOFT-CDO-BUSYSTATUS:BUSY',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      'X-WR-CALNAME:Mak Timetable',
      'X-WR-TIMEZONE:Africa/Kampala'
    ].join('\r\n');

    const evts = timetableData.map(event => {
      const dtstamp = formatTime(new Date().toISOString());
      const dtstart = formatTime(event.start_time);
      const dtend = formatTime(event.end_time);

      return [
        'BEGIN:VEVENT',
        `UID:${event.course_code.split(' ').join('')}-${dtstart}@makerere.sync`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${event.course_code} - ${event.course_name}`,
        `LOCATION:${event.location}`,
        `DESCRIPTION:Lecturer: ${event.lecturer}`,
        'END:VEVENT'
      ].join('\r\n');
    });

    const footer = 'END:VCALENDAR';

    return [header, ...evts, footer].join('\r\n');
  }
}
