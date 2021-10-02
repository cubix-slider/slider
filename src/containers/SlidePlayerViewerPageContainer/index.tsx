import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { IAgoraRTCClient, ClientRole, IAgoraRTC } from 'agora-rtc-sdk-ng';

import SwiperCore, { Navigation, Keyboard, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Box, styled } from '@mui/system';
import { Typography, IconButton, Button, Divider } from '@mui/material';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { GlobalStyles } from '../../components/GlobalStyles';

import { usePusherSubscribe } from '../../hooks/usePusherSubscribe';
import { LinearBuffer } from '../../components/LinearBuffer';

SwiperCore.use([Navigation, Keyboard, Autoplay]);

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

export const SlidePlayerViewerPageContainer = () => {
  const { push } = useRouter();
  const navPrevButtonRef = useRef<HTMLButtonElement>(null);
  const navNextButtonRef = useRef<HTMLButtonElement>(null);

  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const [agoraRtc, setAgoraRtc] = useState<IAgoraRTC | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  const [shouldStopAutoSync, setShouldStopAutoSync] = useState(false);

  const [didAutoplayFailed, setDidAutoplayFailed] = useState(false);

  useEffect(() => {
    const loadAgora = async () => {
      const instance = (await import('agora-rtc-sdk-ng')).default;
      instance.onAudioAutoplayFailed = () => {
        setDidAutoplayFailed(true);
      };
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
        {/* <SlideControls onLeave={leaveChannel} onSync={handleOnSync} /> */}
        <StyledSwiper
          onBeforeInit={onBeforeInit}
          spaceBetween={50}
          slidesPerView={1}
          onSwiper={(swiper) => setSwiper(swiper)}
          autoHeight={true}
          keyboard={{
            enabled: true,
          }}
          navigation={{
            prevEl: navPrevButtonRef.current,
            nextEl: navNextButtonRef.current,
          }}
          autoplay={{
            delay: 2000,
          }}
        >
          <SwiperSlide>
            <Box
              sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: ['30px', null, '56px'],
              }}
            >
              <Typography variant="h1" fontWeight="bold">
                Slider
              </Typography>
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
                justifyContent: 'start',
                alignItems: 'start',
                p: ['30px', null, '56px'],
              }}
            >
              <Typography variant="h1" fontWeight="bold">
                Slider
              </Typography>
              <Divider sx={{ width: '100%' }} />
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
                justifyContent: 'start',
                alignItems: 'center',
                p: ['30px', null, '56px'],
              }}
            >
              <Typography variant="h1">Anong hayop si Karlito? 🐒</Typography>
              <Divider sx={{ width: '100%' }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px',
                  width: '100%',
                  my: '24px',
                }}
              >
                <Box
                  component="img"
                  alt="test image placeholder"
                  src="https://cdn-images-1.medium.com/max/1200/1*WUKSrMzbSE3hGmvoUAMcQQ.png"
                  width="100%"
                  height="100%"
                />
                <Box
                  component="img"
                  alt="test image placeholder"
                  src="https://www.pngitem.com/pimgs/m/734-7346479_livestream-png-transparent-png.png"
                  width="100%"
                  height="100%"
                />
              </Box>
            </Box>
          </SwiperSlide>
          <SwiperSlide>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'start',
                p: ['30px', null, '56px'],
              }}
            >
              <Typography variant="h3" textAlign="center">
                {`Nakita mo na umiiyak si Danica sa hallway. Nalaman mo na si Danica ay "Broken Hearted". Ano ang iyong gagawin?`}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: ['1fr', null, 'repeat(2, 1fr)'],
                  gap: '16px',
                  my: '96px',
                  mx: 'auto',
                }}
              >
                <Button
                  variant="outlined"
                  sx={{ textTransform: 'unset', fontSize: '24px', p: '16px' }}
                >
                  Magpapayo kay Danica ng magagandang salita
                </Button>
                <Button
                  variant="outlined"
                  sx={{ textTransform: 'unset', fontSize: '24px', p: '16px' }}
                >
                  Tatawanan si Danica
                </Button>
                <Button
                  variant="outlined"
                  sx={{ textTransform: 'unset', fontSize: '24px', p: '16px' }}
                >
                  Bibigyan si Danica ng pang kulam
                </Button>
                <Button
                  variant="outlined"
                  sx={{ textTransform: 'unset', fontSize: '24px', p: '16px' }}
                >
                  Wala akong paki kay Danica
                </Button>
              </Box>
            </Box>
          </SwiperSlide>
          <SwiperSlide>
            <Box
              sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: ['30px', null, '56px'],
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mt: '40px',
                }}
              >
                {`It's not about how small or big... It's about how passionate you are bringing value to the community`}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: '40px',
                }}
              >
                Your friends at&nbsp;
                <Box
                  component="span"
                  sx={{
                    backgroundColor: '#1976d2',
                    p: '8px',
                    borderRadius: '8px',
                  }}
                  color="white"
                >
                  Cubix ❤️
                </Box>
              </Typography>
            </Box>
          </SwiperSlide>
          <LinearBuffer />
        </StyledSwiper>
        <IconButton
          ref={navPrevButtonRef}
          sx={{
            position: 'fixed',
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
            position: 'fixed',
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
      </Box>
    </>
  );
};
