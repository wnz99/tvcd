import omit from 'lodash/omit';

const onSubscriptionMsg = (event, subs) => {
  try {
    const msg = JSON.parse(event.data);

    if (msg.subscribe && msg.success) {
      return {
        ...subs,
        [msg.subscribe]: {
          ...msg.request,
        },
      };
    }

    if (msg.unsubscribe && msg.success) {
      return omit(subs, [msg.unsubscribe]);
    }

    return subs;
  } catch (e) {
    return subs;
  }
};

export default onSubscriptionMsg;
