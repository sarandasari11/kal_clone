import { Resend } from 'resend'
import { format } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY || 're_test_key')

interface EmailProps {
  type: 'created' | 'cancelled' | 'rescheduled'
  to: string
  eventTitle: string
  startTime: Date
  endTime: Date
  bookerName: string
  previousStartTime?: Date
}

export async function sendBookingEmail({
  type,
  to,
  eventTitle,
  startTime,
  endTime,
  bookerName,
}: EmailProps) {
  const isCreated = type === 'created'
  const isRescheduled = type === 'rescheduled'
  
  const subject = isRescheduled 
    ? `Rescheduled: ${eventTitle} with Admin`
    : isCreated
      ? `Confirmed: ${eventTitle} with Admin`
      : `Cancelled: ${eventTitle} with Admin`

  const dateStr = format(startTime, 'EEEE, MMMM d, yyyy')
  const timeStr = `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`

  const actionText = isRescheduled ? 'rescheduled' : isCreated ? 'confirmed' : 'cancelled'
  const upcomingText = isRescheduled ? 'rescheduled' : isCreated ? 'upcoming' : 'cancelled'

  const html = `
    <div style="font-family: sans-serif; max-w-xl mx-auto p-4">
      <h2>Your meeting has been ${actionText}.</h2>
      <p>Hi ${bookerName},</p>
      <p>Here are the details of your ${upcomingText} meeting:</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time:</strong> ${timeStr}</p>
      </div>
      <p>Thanks,<br/>KalClone Team</p>
    </div>
  `

  if (!process.env.RESEND_API_KEY) {
    console.log('\n--- MOCK EMAIL SENT ---')
    console.log(`To: ${to}\nSubject: ${subject}\nHTML payload length: ${html.length} chars`)
    console.log('-----------------------\n')
    return { success: true, mocked: true }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'KalClone <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Email failed to send:', error)
    throw error
  }
}
