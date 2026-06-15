export interface CalendarTask {
  label: string;
  description?: string | null;
  date: Date;
}

export function generateICS(tasks: CalendarTask[]): string {
  let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//FloraFile//EN\n`;
  
  for (const task of tasks) {
    const taskDate = new Date(task.date);
    
    // Format YYYYMMDDTHHMMSSZ
    const d = taskDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    // All-day event or 0900 local equivalent. Using UTC 09:00 for simplicity.
    const startStr = d.replace(/T.*/, 'T090000Z');
    const endStr = d.replace(/T.*/, 'T100000Z');

    ics += `BEGIN:VEVENT\n`;
    ics += `UID:${Math.random().toString(36).substring(2)}@florafile.app\n`;
    ics += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
    ics += `DTSTART:${startStr}\n`;
    ics += `DTEND:${endStr}\n`;
    ics += `SUMMARY:${task.label}\n`;
    if (task.description) {
      ics += `DESCRIPTION:${task.description}\n`;
    }
    ics += `END:VEVENT\n`;
  }
  
  ics += `END:VCALENDAR\n`;
  return ics;
}
