import { gql } from '@apollo/client';

// A subscription rather than the web's `useQuery`: this screen mounts on drawer
// focus, possibly before akka-apps has created the pad.
const SHARED_NOTES_SUBSCRIPTION = gql`
  subscription sharedNotes($externalId: String!) {
    sharedNotes(where: { sharedNotesExtId: { _eq: $externalId } }) {
      padId
      sharedNotesExtId
      sharedNotesEditor
      lastUpdatedAt
    }
  }
`;

export default {
  SHARED_NOTES_SUBSCRIPTION,
};
