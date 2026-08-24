import { gql } from '@apollo/client';

const EMOJIS_TO_RAIN_SUBSCRIPTION = gql`
  subscription getEmojisToRain($initialCursor: timestamptz) {
    user_reaction_stream(
      batch_size: 10,
      cursor: { initial_value: { createdAt: $initialCursor } }
    ) {
      createdAt
      reactionEmoji
      userId
    }
  }
`;

export default {
  EMOJIS_TO_RAIN_SUBSCRIPTION,
};
