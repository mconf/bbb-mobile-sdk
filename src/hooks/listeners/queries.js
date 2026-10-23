import { gql } from '@apollo/client';

const BREAKOUT_INVITE_SUBSCRIPTION = gql`
  subscription breakoutInviteSubscription {
    breakoutRoom {
      joinURL
      shortName
      freeJoin
      breakoutRoomMeetingId
      isLastAssignedRoom
      isUserCurrentlyInRoom
      assignedUsers {
        userId
      }
    }
  }
`;

const PLUGIN_DATA_CHANNEL_NEW_ITEMS = gql`
  subscription FetchPluginDataChannelPublicEntry ($pluginNames: [String!]!,
    $channelName: String! , $subChannelName: String!){
    pluginDataChannelEntry_public(
      where: {
        pluginName: { _in: $pluginNames }
        channelName: { _eq: $channelName }
        subChannelName: { _eq: $subChannelName }
      }
      order_by: { createdAt: desc }
      limit: 1
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
