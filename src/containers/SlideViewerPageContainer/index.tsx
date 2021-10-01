import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { IAgoraRTCClient, ClientRole, IAgoraRTC } from 'agora-rtc-sdk-ng';

import SwiperCore, { Navigation, Keyboard } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Box, styled } from '@mui/system';
import { Typography, IconButton } from '@mui/material';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { GlobalStyles } from '../../components/GlobalStyles';
import { SlideControls } from './components/SlideControls';

import { usePusherSubscribe } from '../../hooks/usePusherSubscribe';

SwiperCore.use([Navigation, Keyboard]);

const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;
`;

const options = {
  // Pass your app ID here.
  appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
  // Set the channel name.
  channel: 'test-channel',
  // Pass a token if your project enables the App Certificate.
  token:
    '006d32246dedc6f421fb57687c4e957bd93IADUKrjxQvF4XnMSAcR1v2j5mVKk0R07IYkXjE1uRGlVJmLMzZAAAAAAEADSvifOb4FYYQEAAQBwgVhh',
  // Set the user role in the channel.
  role: 'audience' as ClientRole,
};

export const SlideViewerPageContainer = () => {
  const { push } = useRouter();
  const navPrevButtonRef = useRef<HTMLButtonElement>(null);
  const navNextButtonRef = useRef<HTMLButtonElement>(null);

  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const [agoraRtc, setAgoraRtc] = useState<IAgoraRTC | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  const [shouldStopAutoSync, setShouldStopAutoSync] = useState(false);

  useEffect(() => {
    const loadAgora = async () => {
      const instance = (await import('agora-rtc-sdk-ng')).default;
      setAgoraRtc(instance);

      const createdClient = instance.createClient({
        mode: 'live',
        codec: 'vp8',
      });
      setClient(createdClient);

      if (!createdClient) return;
      if (!instance) return;

      createdClient.setClientRole(options.role);
      await createdClient.join(
        options.appId,
        options.channel,
        options.token,
        null
      );

      createdClient.on('user-published', async (user, mediaType) => {
        await createdClient.subscribe(user, mediaType);

        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });
    };

    loadAgora();
  }, []);

  const createClient = () => {
    if (!agoraRtc) return;

    const createdClient = agoraRtc.createClient({ mode: 'live', codec: 'vp8' });
    setClient(createdClient);

    return createdClient;
  };

  // TODO - Remove
  const joinChannel = async (createdAgoraRtc: IAgoraRTC) => {
    const createdClient = createClient();

    if (!createdClient) return;
    if (!createdAgoraRtc) return;

    createdClient.setClientRole(options.role);
    await createdClient.join(
      options.appId,
      options.channel,
      options.token,
      null
    );

    createdClient.on('user-published', async (user, mediaType) => {
      await createdClient.subscribe(user, mediaType);

      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });
  };

  const leaveChannel = async () => {
    client?.leave();
  };

  const onBeforeInit = (swiper: SwiperCore) => {
    if (typeof swiper.params.navigation === 'boolean') {
      return;
    }

    const navigation = swiper.params.navigation;

    if (!navigation) {
      return;
    }

    navigation.prevEl = navPrevButtonRef.current;
    navigation.nextEl = navNextButtonRef.current;
  };

  const handleOnSync = () => {
    if (!swiper) {
      return;
    }

    swiper.slideTo(activeSlide);
    setShouldStopAutoSync(false);
  };

  usePusherSubscribe(
    'slide-1',
    'event:slider-slide',
    (data: Record<'slideIndex', number>) => {
      setActiveSlide(data.slideIndex);
    }
  );

  useEffect(() => {
    if (shouldStopAutoSync) {
      return;
    }

    if (!swiper) {
      return;
    }

    swiper.slideTo(activeSlide);
  }, [activeSlide, shouldStopAutoSync, swiper]);

  return (
    <>
      <GlobalStyles />
      <Box
        sx={{
          height: '100%',
        }}
      >
        <SlideControls onLeave={leaveChannel} onSync={handleOnSync} />
        <StyledSwiper
          onBeforeInit={onBeforeInit}
          spaceBetween={50}
          slidesPerView={1}
          onSwiper={(swiper) => setSwiper(swiper)}
          keyboard={{
            enabled: true,
          }}
          navigation={{
            prevEl: navPrevButtonRef.current,
            nextEl: navNextButtonRef.current,
          }}
        >
          <SwiperSlide>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography variant="h1">Slider</Typography>
              <Typography
                variant="h5"
                sx={{
                  mt: '40px',
                }}
              >
                An interactive way to create presentations
              </Typography>
            </Box>
          </SwiperSlide>
          <SwiperSlide>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              Slide 2
            </Box>
          </SwiperSlide>
          <SwiperSlide>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              Slide 3
            </Box>
          </SwiperSlide>
          <SwiperSlide>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              Slide 4
            </Box>
          </SwiperSlide>
          <IconButton
            ref={navPrevButtonRef}
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 72,
              zIndex: 2,
            }}
            onClick={() => {
              setShouldStopAutoSync(true);
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton
            ref={navNextButtonRef}
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              zIndex: 2,
            }}
            onClick={() => {
              setShouldStopAutoSync(true);
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </StyledSwiper>
      </Box>
    </>
  );
};
