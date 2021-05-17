import omit from 'lodash/omit';

const onSubscriptionMsg = (event, subs) => {
  const msg = JSON.parse(event.data);

  switch (msg.event) {
    case 'subscribed': {
      const { channel, key } = msg;
      return {
        ...subs,
        [msg.chanId]: {
          channel,
          key,
          event: 'subscribe',
        },
      };
    }
    case 'unsubscribed': {
      return omit(subs, [msg.chanId]);
    }
    default:
      return subs;
  }
};

export default onSubscriptionMsg;
