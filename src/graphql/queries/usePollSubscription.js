import { gql } from '@apollo/client';

const POLL_ACTIVE_SUBSCRIPTION = gql`
  subscription PollActive {
    poll (where: {published: {_eq: false}, ended: {_eq: false}}, order_by: [{ publishedAt: desc }], limit: 1) {
      ended
      published
      pollId
      type
      questionText
      multipleResponses
      secret
      quiz
      userCurrent {
        responded
      }
      options {
        optionDesc
        optionId
        pollId
      }
      responses {
        optionId
        optionDesc
        optionResponsesCount
        pollResponsesCount
        questionText
      }
      users {
        responded
        optionDescIds
        user {
          name
          userId
        }
      }
    }
  }
`;

const PUBLISHED_POLLS_SUBSCRIPTION = gql`
  subscription PollResults {
    poll (where: {published: {_eq: true}}, order_by: [{ publishedAt: desc }], limit: 100) {
      ended
      published
      publishedAt
      pollId
      type
      questionText
      multipleResponses
      secret
      quiz
      responses {
        optionDesc
        optionId
        optionResponsesCount
        pollResponsesCount
      }
    }
  }
`;

export {
  POLL_ACTIVE_SUBSCRIPTION,
  PUBLISHED_POLLS_SUBSCRIPTION
};
