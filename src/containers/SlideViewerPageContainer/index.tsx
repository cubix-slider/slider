import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import { IAgoraRTCClient, ClientRole, IAgoraRTC } from 'agora-rtc-sdk-ng';

import SwiperCore, { Navigation, Keyboard } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Box, styled } from '@mui/system';
import {
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { GlobalStyles } from '../../components/GlobalStyles';
import { SlideControls } from './components/SlideControls';

import { usePusherSubscribe } from '../../hooks/usePusherSubscribe';

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

SwiperCore.use([Navigation, Keyboard]);

const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;
`;

const options = {
  // Pass your app ID here.
  appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
  // Pass your primary certificate here.
  primaryCertificate: process.env.NEXT_PUBLIC_AGORA_PRIMARY_CERTIFICATE || '',
  // Set the user role in the channel.
  role: 'audience' as ClientRole,
};

export const SlideViewerPageContainer = () => {
  const router = useRouter();
  const { push } = router;
  const { view_id } = router.query;
  
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

      if (!view_id) return

      const channelName = view_id as string;
      const uid = Math.floor(100000000 + Math.random() * 900000000);;
      const role = RtcRole.SUBSCRIBER;
  
      const expirationTimeInSeconds = 86400;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
      const generatedToken = RtcTokenBuilder.buildTokenWithUid(options.appId, options.primaryCertificate, channelName, uid, role, privilegeExpiredTs);
      
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
        channelName,
        generatedToken,
        uid
      );

      createdClient.on('user-published', async (user, mediaType) => {
        await createdClient.subscribe(user, mediaType);

        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });
    };

    loadAgora();
  }, [view_id]);

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
        {didAutoplayFailed && (
          <Dialog
            open={didAutoplayFailed}
            onClose={() => setDidAutoplayFailed(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {'Cubix Slider encountered error with the sound from your end'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Let Cubix Slider sync again your sound to provide better quality
                service
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDidAutoplayFailed(false)} autoFocus>
                Sync again
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <SlideControls onLeave={leaveChannel} onSync={handleOnSync} />
        <StyledSwiper
          onBeforeInit={onBeforeInit}
          spaceBetween={50}
          slidesPerView={1}
          autoHeight={true}
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
                p: ['30px', null, '56px'],
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
                justifyContent: 'start',
                alignItems: 'start',
                p: ['30px', null, '56px'],
              }}
            >
              <Typography variant="h1">Slider</Typography>
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
                alignItems: 'start',
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
                {Array.from(new Array(2)).map((k) => (
                  <Box
                    key={k}
                    component="img"
                    src="https://via.placeholder.com/500"
                    width="100%"
                    height="100%"
                  />
                ))}
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
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                p: ['30px', null, '56px'],
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
