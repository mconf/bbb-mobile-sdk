import { store } from '../../../store/redux/store';
import Module from './module';
import {
  addGroupChatMsg,
  addGroupChatMsgBeforeJoin,
  clearChatMessages,
  editGroupChatMsg,
} from '../../../store/redux/slices/group-chat-msg';

import {
  addPreviousPollPublished,
  addPreviousPollPublishedViaChat,
} from '../../../store/redux/slices/wide-app/previous-poll-published';

const GROUP_CHAT_MSG_TOPIC = 'group-chat-msg';
const TIME_BETWEEN_FETCHS = 1000;
const ITENS_PER_PAGE = 100;

export class GroupChatMsgModule extends Module {
  constructor(messageSender) {
    super(GROUP_CHAT_MSG_TOPIC, messageSender);
  }

  async startSyncMessagesbeforeJoin() {
    const getMessagesBeforeJoinCounter = async () => {
      return this.messageSender.makeCall('chatMessageBeforeJoinCounter');
    };

    const chatsMessagesCount = await getMessagesBeforeJoinCounter();
    const pagesPerChat = chatsMessagesCount.map((chat) => ({
      ...chat,
      pages: Math.ceil(chat.count / ITENS_PER_PAGE),
      syncedPages: 0,
    }));

    const syncRoutine = async (chatsToSync) => {
      if (!chatsToSync.length) return;

      const pagesToFetch = [...chatsToSync].sort((a, b) => a.pages - b.pages);
      const chatWithLessPages = pagesToFetch[0];
      chatWithLessPages.syncedPages += 1;
      const messagesFromPage = await this.messageSender.makeCall(
        'fetchMessagePerPage',
        chatWithLessPages.chatId,
        chatWithLessPages.syncedPages
      );

      if (messagesFromPage.length) {
        messagesFromPage.map((msgObj) => {
          if (msgObj.id.toString().includes('POLL_RESULT')) {
            store.dispatch(
              addPreviousPollPublished({
                previousPollPublishedObject: msgObj,
              })
            );
          }
          // hyperlink
          if (msgObj.message.toString().includes('href=')) {
            const pattern = /href='(.+)'/;
            const path = msgObj.message.toString();
            const match = path.match(pattern);
            return store.dispatch(
              addGroupChatMsgBeforeJoin({
                groupChatMsgObject: { ...msgObj, message: match[1] },
              })
            );
          }
          return store.dispatch(
            addGroupChatMsgBeforeJoin({
              groupChatMsgObject: msgObj,
            })
          );
        });
      }
      // TODO review this promise
      await new Promise((r) => {
        setTimeout(r, TIME_BETWEEN_FETCHS);
      });
      await syncRoutine(
        pagesToFetch.filter((chat) => !(chat.syncedPages > chat.pages))
      );
    };
    await syncRoutine(pagesPerChat);
  }

  async onConnected() {
    this.topics.forEach((topic) => {
      this.subscribeToCollection(topic, 0);
    });
    await this.startSyncMessagesbeforeJoin();
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    if (msgObj.fields.id.toString().includes('POLL_RESULT')) {
      store.dispatch(
        addPreviousPollPublishedViaChat({
          previousPollPublishedObject: msgObj,
        })
      );
    }
    if (msgObj.fields.id.toString().includes('PUBLIC_CHAT_CLEAR')) {
      store.dispatch(clearChatMessages());
      store.dispatch(
        addGroupChatMsg({
          groupChatMsgObject: msgObj,
        })
      );
    }
    // hyperlink
    if (msgObj.fields.message.toString().includes('href=')) {
      const pattern = /href='(.+)'/;
      const path = msgObj.fields.message.toString();
      const match = path.match(pattern);
      return store.dispatch(
        addGroupChatMsg({
          groupChatMsgObject: {
            ...msgObj,
            fields: { ...msgObj.fields, message: match[1] },
          },
        })
      );
    }
    return store.dispatch(
      addGroupChatMsg({
        groupChatMsgObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  remove(msgObj) {
    // Removing this to avoid the meteor calls when clear chat
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editGroupChatMsg({
        groupChatMsgObject: msgObj,
      })
    );
  }
}
