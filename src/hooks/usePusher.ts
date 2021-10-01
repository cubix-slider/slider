import { 
  useEffect,
  useRef,
} from 'react';

import Pusher from 'pusher-js';

import {
  ENV_PUSHER_API_KEY,
  ENV_PUSHER_CLUSTER,
} from '../constants/envs';

export const usePusher = () => {
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (pusherRef.current) {
      return;
    }

    const pusher = new Pusher(ENV_PUSHER_API_KEY, {
      cluster: ENV_PUSHER_CLUSTER,
    });

    pusherRef.current = pusher;
  }, []);

  return pusherRef;
};
