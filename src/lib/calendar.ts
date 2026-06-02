export interface CalendarTask {
  label: string;
  description?: string | null;
  dayOfWeek: number; // 0-6
  weekStart: Date;
}

export function generateICS(tasks: CalendarTask[]): string {
  let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//FloraFile//EN\n`;
  
  for (const task of tasks) {
    const taskDate = new Date(task.weekStart);
    // weekStart is Monday, so taskDate.getDay() is 1.
    // We want to add (task.dayOfWeek - 1) days. If dayOfWeek is 0 (Sunday), we add 6 days to get the Sunday of that week.
    let offset = task.dayOfWeek - 1;
    if (offset < 0) offset += 7; // Sunday becomes +6 days from Monday.
    taskDate.setDate(taskDate.getDate() + offset);
    
    // Format YYYYMMDDTHHMMSSZ
    const d = taskDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    // Let's make it an all-day event or just set a time like 0900.
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
