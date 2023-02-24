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
    503: t('app.error.503'), // upstream: app.error.503
    500: t('app.error.500'), // upstream: app.error.500
    410: t('app.error.410'), // upstream :'app.error.410'
    409: t('app.error.409'), // upstream: 'app.error.409',
    408: t('app.error.408'), // upstream: 'app.error.408',
    404: t('app.error.404'), // upstream: 'app.error.404',
    403: t('app.error.403'), // upstream: app.error.403',
    401: t('app.error.401'), // upstream: 'app.error.401',
    400: t('app.error.400'), // upstream: 'app.error.400',
    user_logged_out_reason: t('app.error.userLoggedOut'), // upstream: 'app.error.userLoggedOut',
    validate_token_failed_eject_reason: t('app.error.ejectedUser'), // upstream:  'app.error.ejectedUser',
    banned_user_rejoining_reason: t('app.error.userBanned'), // upstream: app.error.userBanned',
    user_inactivity_eject_reason: t('app.meeting.logout.userInactivityEjectReason'), // upstream: 'app.meeting.logout.userInactivityEjectReason',
    user_requested_eject_reason: t('app.meeting.logout.ejectedFromMeeting'), // upstream: 'app.meeting.logout.ejectedFromMeeting',
    max_participants_reason: t('app.meeting.logout.maxParticipantsReached'), // upstream: 'app.meeting.logout.maxParticipantsReached',
    duplicate_user_in_meeting_eject_reason: t('app.meeting.logout.duplicateUserEjectReason'), // upstream: 'app.meeting.logout.duplicateUserEjectReason',
    not_enough_permission_eject_reason: t('app.meeting.logout.permissionEjectReason'), // upstream: 'app.meeting.logout.permissionEjectReason',
    able_to_rejoin_user_disconnected_reason: t('app.error.disconnected.rejoin'), // upstream: 'app.error.disconnected.rejoin',
    guest_noModeratorResponse: t('app.guest.noModeratorResponse'), // upstream: "app.guest.noModeratorResponse"
    guest_noSessionToken: t('app.guest.noSessionToken'), // upstream: "app.guest.noSessionToken"
    guest_guestDeny: t('app.guest.guestDeny'), // app.guest.guestDeny
    guest_DENY: t('app.guest.guestDeny'), // Client fallback to app.guest.guestDeny
    guest_missingToken: t('app.guest.missingToken'), // upstream: "app.guest.missingToken"
    guest_missingSession: t('app.guest.missingSession'), // upstream: "app.guest.missingSession"
    guest_missingMeeting: t('app.guest.missingMeeting'), // upstream: "app.guest.missingMeeting"
    guest_meetingEnded: t('app.guest.meetingEnded'), // upstream: "app.guest.meetingEnded"
    guest_seatWait: t('app.guest.seatWait'), // upstream: "app.guest.seatWait"
    guest_guestInvalid: t('app.guest.guestInvalid'), // upstream: "app.guest.guestInvalid"
    guest_meetingForciblyEnded: t('app.guest.meetingForciblyEnded'), // upstream: "app.guest.meetingForciblyEnded"
    // Internal app strings
    logged_out: t('app.feedback.title'), // upstream: "app.feedback.title"
    meeting_ended: t('app.meeting.ended'), // upstream: "app.meeting.ended"
    guest_FAILED: t('Unexpected guest sign-in failure'),
    FALLBACK_REASON: t('Unexpected end of session, try to sign in again'),
  };

  return END_REASON_STRINGS[currentEndReason]
  || END_REASON_STRINGS[previousEndReason]
  || END_REASON_STRINGS.FALLBACK_REASON;
};

export default useEndReason;
