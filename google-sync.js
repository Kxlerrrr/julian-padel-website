import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { date, slot, email clientName } = req.body;

  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']
  );

  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: `Padelles met ${clientName}`,
    description: `Geboekt via website. Contact: ${email}`,
    start: { dateTime: `${date}T${slot.split(' - ')[0]}:00+01:00` },
    end: { dateTime: `${date}T${slot.split(' - ')[1]}:00+01:00` },
  };

  try {
    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}