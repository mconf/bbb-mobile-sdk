import { gql } from '@apollo/client';

export interface VoiceActivityResponse {
  user_voice_activity_stream: Array<{
    userId: string;
    voiceUserId: string;
    talking: boolean;
    muted: boolean;
    leftVoiceConf: boolean;
    user: {
      color: string;
      name: string;
      speechLocale: string | undefined;
      role: string;
    };
  }>;
}

// This subscription is handled by bbb-graphql-middleware and its content should
// NOT be modified. The operation name `getUserVoiceStateStream` is matched
// verbatim by the middleware, which serves it from Redis and multiplexes the
// stream across all clients (including web). Renaming it (or altering the field
// set) drops out of that interception and silently falls back to a mobile-only
// Hasura streaming cohort. Mirrors bbb-html5 core/graphql/queries/voiceActivity.ts.
export const VOICE_ACTIVITY = gql`
  subscription getUserVoiceStateStream {
    user_voice_activity_stream(
      cursor: { initial_value: { voiceActivityAt: "2020-01-01" } },
      batch_size: 10
    ) {
      userId
      voiceUserId
      talking
      muted
      leftVoiceConf
      user {
        color
        name
        speechLocale
        role
      }
    }
  }
`;

export default VOICE_ACTIVITY;
