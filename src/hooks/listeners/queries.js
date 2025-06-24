import { gql } from '@apollo/client';

const BREAKOUT_INVITE_SUBSCRIPTION = gql`
  subscription breakoutInviteSubscription {
    breakoutRoom {
      joinURL
      shortName
      freeJoin
      breakoutRoomId
      isLastAssignedRoom
      isUserCurrentlyInRoom
      assignedUsers {
        userId
      }
    }
  }
`;

const PLUGIN_DATA_CHANNEL_NEW_ITEMS = gql`
  subscription FetchPluginDataChannelEntry($pluginName: String!,
    $channelName: String! , $createdAt: timestamptz!, $subChannelName: String!){
    pluginDataChannelEntry_stream(
      cursor: {initial_value: {createdAt: $createdAt}}, batch_size: 100,
      where: {
        pluginName: { _eq: $pluginName }
        channelName: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
    ) {
      createdAt,
      channelName,
      subChannelName,
      entryId,
      payloadJson,
      createdBy,
      pluginName,
      toRoles,
    }
  }
`;

export default { BREAKOUT_INVITE_SUBSCRIPTION, PLUGIN_DATA_CHANNEL_NEW_ITEMS };
