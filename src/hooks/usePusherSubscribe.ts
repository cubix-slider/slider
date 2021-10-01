import { useEffect, useRef } from 'react';
import { usePusher } from './usePusher';

export const usePusherSubscribe = (
  channelName: string,
  eventName: string,
  eventHandler: (data: any) => void,
) => {
  const pusherRef = usePusher();

  const handler = useRef<(data: any) => void>(eventHandler);

  useEffect(() => {
    if (!pusherRef.current) {
      return;
    }

    const channel = pusherRef.current.subscribe(channelName);

    channel.bind(eventName, (data: any) => {
      handler.current(data);
    });

    return () => channel.cancelSubscription();
  }, [channelName, eventName, pusherRef]);
};
