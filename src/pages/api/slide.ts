// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

// import Pusher from 'pusher';

// import {
//   ENV_PUSHER_API_KEY,
//   ENV_PUSHER_APP_ID,
//   ENV_PUSHER_CLUSTER,
//   ENV_PUSHER_SECRET_KEY,
// } from '../../constants/envs';
// import { Events } from '../../constants/events';

export type Data = {};

const handler = (req: NextApiRequest, res: NextApiResponse<Data>) => {
  // console.log(1);
  // if (req.method !== 'POST') {
  //   return res.status(404);
  // }
  // console.log(2);

  // const pusher = new Pusher({
  //   appId: ENV_PUSHER_APP_ID,
  //   key: ENV_PUSHER_API_KEY,
  //   secret: ENV_PUSHER_SECRET_KEY,
  //   cluster: ENV_PUSHER_CLUSTER,
  // });


  // await pusher.trigger('slide-1', Events.SliderSlide, req.body);
  
  res.status(200).json({ name: 'John Doe' });
  // res.status(204).json({});
};
export default handler;
