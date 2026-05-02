const IST = 'Asia/Kolkata';

const dateFmt = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export function formatBookingDate(isoString: string): string {
  return dateFmt.format(new Date(isoString));
}

export function formatBookingTime(isoString: string): string {
  return timeFmt.format(new Date(isoString));
}

export function slotEndsAt(starts: Date): Date {
  return new Date(starts.getTime() + 120 * 60 * 1000);
}
