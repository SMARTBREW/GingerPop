export const INVITE_VALID_DAYS = 14;

export function inviteExpiresAt(from: Date = new Date()) {
  const expires = new Date(from);
  expires.setDate(expires.getDate() + INVITE_VALID_DAYS);
  return expires;
}

export function getInvitationExpiresAt(invitation: {
  expiresAt?: Date;
  sentAt?: Date;
  createdAt?: Date;
}) {
  if (invitation.expiresAt) return new Date(invitation.expiresAt);
  const base = invitation.sentAt ?? invitation.createdAt ?? new Date();
  return inviteExpiresAt(base);
}

export function isInvitationExpired(invitation: {
  expiresAt?: Date;
  sentAt?: Date;
  createdAt?: Date;
  phase?: string;
  status?: string;
}) {
  const completed = invitation.phase === "completed" || invitation.status === "completed";
  if (completed) return false;
  return Date.now() > getInvitationExpiresAt(invitation).getTime();
}

export const INVITE_EXPIRED_MESSAGE =
  "This invitation link has expired. Please contact your administrator for a new invite.";
