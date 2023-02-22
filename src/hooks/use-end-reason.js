import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import usePrevious from './use-previous';

const useEndReason = () => {
  const currentEndReason = useSelector((state) => state.client.sessionState.endReason);
  // Track previous end reason - if it transitions from a string to null, that's
  // a bug, but we want the previous one as a fallback.
  const previousEndReason = usePrevious(currentEndReason);
  const { t } = useTranslation();

  const END_REASON_STRINGS = {
    503: t('You have been disconnected'), // upstream: app.error.503
    500: t('Oops, something went wrong'), // upstream: app.error.500
    410: t('The conference ended'), // upstream :'app.error.410'
    409: t('Conflict'), // upstream: 'app.error.409',
    408: t('Authentication failure'), // upstream: 'app.error.408',
    404: t('Not found'), // upstream: 'app.error.404',
    403: t('You have been removed from the conference'), // upstream: app.error.403',
    401: t('Not authorized'), // upstream: 'app.error.401',
    400: t('400 Bad request'), // upstream: 'app.error.400',
    user_logged_out_reason: t('Attendee has an invalid session token because they logged out'), // upstream: 'app.error.userLoggedOut',
    validate_token_failed_eject_reason: t('Attendee has an invalid session token because it was locked out'), // upstream:  'app.error.ejectedUser',
    banned_user_rejoining_reason: t('Attendee has been blocked'), // upstream: app.error.userBanned',
    user_inactivity_eject_reason: t('Attendee inactive for a long time'), // upstream: 'app.meeting.logout.userInactivityEjectReason',
    user_requested_eject_reason: t('You have been removed from the conference'), // upstream: 'app.meeting.logout.ejectedFromMeeting',
    max_participants_reason: t('The session has reached the maximum number of participants'), // upstream: 'app.meeting.logout.maxParticipantsReached',
    duplicate_user_in_meeting_eject_reason: t('Duplicate user trying to join the conference'), // upstream: 'app.meeting.logout.duplicateUserEjectReason',
    not_enough_permission_eject_reason: t('Removed from the conference due to a permission violation'), // upstream: 'app.meeting.logout.permissionEjectReason',
    able_to_rejoin_user_disconnected_reason: t('Please log in again'), // upstream: 'app.error.disconnected.rejoin',
    guest_noModeratorResponse: t('No response from moderator'), // upstream: "app.guest.noModeratorResponse"
    guest_noSessionToken: t('Session token not received'), // upstream: "app.guest.noSessionToken"
    guest_guestDeny: t('Guest entry denied'),
    guest_DENY: t('Guest entry denied'), // Client fallback to guest_guestDeny
    guest_missingToken: t('Guest without session token'), // upstream: "app.guest.missingToken"
    guest_missingSession: t('Guest without session'), // upstream: "app.guest.missingSession"
    guest_missingMeeting: t('Non-existent meeting'), // upstream: "app.guest.missingMeeting"
    guest_meetingEnded: t('Meeting ended'), // upstream: "app.guest.meetingEnded"
    guest_seatWait: t('Guest waiting for a seat at the meeting'), // upstream: "app.guest.seatWait"
    guest_guestInvalid: t('Invalid guest'), // upstream: "app.guest.guestInvalid"
    guest_meetingForciblyEnded: t('You cannot access a session that has already ended'), // upstream: "app.guest.meetingForciblyEnded"
    // Internal app strings
    logged_out: t('You left the conference'), // upstream: "app.feedback.title"
    meeting_ended: t('This session has ended'), // upstream: "app.meeting.ended"
    guest_FAILED: t('Unexpected guest sign-in failure'),
    FALLBACK_REASON: t('Unexpected end of session, try to sign in again'),
  };

  return END_REASON_STRINGS[currentEndReason]
  || END_REASON_STRINGS[previousEndReason]
  || END_REASON_STRINGS.FALLBACK_REASON;
};

export default useEndReason;
