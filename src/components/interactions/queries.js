import { gql } from '@apollo/client';

const USER_CURRENT_RAISE_HAND_SUBSCRIPTION = gql`
  subscription userCurrentRaiseHand {
    user_current {
      raiseHand
    }
  }
`;

const SET_RAISE_HAND = gql`
  mutation UserSetRaiseHand($userId: String, $raiseHand: Boolean!) {
    userSetRaiseHand(userId: $userId, raiseHand: $raiseHand)
  }
`;

const USER_CURRENT_REACTION_SUBSCRIPTION = gql`
  subscription userCurrentReaction {
    user_current {
      reactionEmoji
    }
  }
`;

const SET_REACTION_EMOJI = gql`
  mutation SetReactionEmoji($reactionEmoji: String!) {
    userSetReactionEmoji(reactionEmoji: $reactionEmoji)
  }
`;

export default {
  USER_CURRENT_RAISE_HAND_SUBSCRIPTION,
  USER_CURRENT_REACTION_SUBSCRIPTION,
  SET_RAISE_HAND,
  SET_REACTION_EMOJI
};
