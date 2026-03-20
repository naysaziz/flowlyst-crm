import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({
  region: process.env.AWS_SES_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY!,
  },
})

export async function sendInviteEmail({
  to,
  workspaceName,
  inviterEmail,
  role,
  inviteToken,
}: {
  to: string
  workspaceName: string
  inviterEmail: string
  role: string
  inviteToken: string
}): Promise<void> {
  const inviteUrl = `https://flowlyst.app/invite/${inviteToken}`

  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL ?? 'invites@flowlyst.app',
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: {
        Data: `You've been invited to join ${workspaceName} on Flowlyst`,
      },
      Body: {
        Html: {
          Data: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
              <h2 style="color:#111827;">You've been invited to join ${workspaceName}</h2>
              <p style="color:#374151;">${inviterEmail} has invited you to join
              <strong>${workspaceName}</strong> as a <strong>${role}</strong>.</p>
              <p style="color:#374151;">Click the button below to accept the invitation:</p>
              <a href="${inviteUrl}"
                 style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;
                        text-decoration:none;border-radius:6px;font-weight:600;">
                Accept Invitation
              </a>
              <p style="color:#6b7280;font-size:14px;margin-top:24px;">
                This invitation expires in 7 days.
              </p>
              <p style="color:#6b7280;font-size:14px;">
                Or copy this link: ${inviteUrl}
              </p>
            </div>
          `,
        },
        Text: {
          Data: `You've been invited to join ${workspaceName} as a ${role}.\n\nAccept invitation: ${inviteUrl}\n\nThis invitation expires in 7 days.`,
        },
      },
    },
  })

  await ses.send(command)
}
