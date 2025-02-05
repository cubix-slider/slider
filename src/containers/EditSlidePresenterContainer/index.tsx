import React, { useRef, useState, useEffect } from 'react';

import SwiperCore, { Navigation, Keyboard } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import NextImage from 'next/image';

import {
  IAgoraRTCClient,
  ClientRole,
  IMicrophoneAudioTrack,
  IAgoraRTC,
} from 'agora-rtc-sdk-ng';

import { Box, styled } from '@mui/system';
import { Typography, IconButton, Divider, Button } from '@mui/material';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { GlobalStyles } from '../../components/GlobalStyles';
import { SlideControls } from './components/SlideControls';

import { ENV_BASE_URL } from '../../constants/envs';

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

// TODO Token Generator

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
  role: 'host' as ClientRole,
};

type RecordingResult = {
  timestamps?: Array<RecordTimeStamp>;
  file?: File;
};

type RecordTimeStamp = {
  slideIndex: number;
  timestamp: number;
};

const questionChoices = [
  'Magpapayo kay Danica ng magagandang salita',
  'Tatawanan si Danica',
  'Bibigyan si Danica ng pang kulam',
  'Wala akong paki kay Danica',
];

export const EditSlidePresenterPageContainer = () => {
  const navPrevButtonRef = useRef<HTMLButtonElement>(null);
  const navNextButtonRef = useRef<HTMLButtonElement>(null);

  const [isPresenting, setIsPresenting] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [agoraRtc, setAgoraRtc] = useState<IAgoraRTC | null>(null);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [recorder, setRecorder] = useState<any>(null);
  const [recordingResult, setRecordingResult] =
    useState<RecordingResult | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const [selectedQuestionChoice, setSelectedQuestionChoice] = useState('');

  useEffect(() => {
    const loadAgora = async () => {
      const instance = (await import('agora-rtc-sdk-ng')).default;
      setAgoraRtc(instance);
    };

    loadAgora();
  }, []);

  useEffect(() => {
    const loadRecorder = async () => {
      const instance = (await import('mic-recorder')).default;
      setRecorder(
        new instance({
          bitRate: 128,
        })
      );
    };

    loadRecorder();
  }, []);

  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);

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

  const handleOnSlideChange = (slideIndex: number) => {
    if (!isPresenting) {
      return;
    }

    try {
      const endpoint = `${ENV_BASE_URL}/api/slide`;

      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slideIndex }),
      });
    } catch (error) {
      console.log('error', error);
    }
  };

  const recordSlideChange = (slideIndex: number) => {
    if (!isRecording) {
      return;
    }

    setRecordingResult((prev) => {
      return {
        ...prev,
        timestamps: [
          ...(prev?.timestamps || []),
          {
            slideIndex,
            timestamp: recorder.context.currentTime,
          },
        ],
      };
    });
  };

  const createClient = () => {
    if (!agoraRtc) return;

    const createdClient = agoraRtc.createClient({ mode: 'live', codec: 'vp8' });
    setClient(createdClient);

    return createdClient;
  };

  const startLive = async () => {
    const createdClient = createClient();

    if (!createdClient) return;
    if (!agoraRtc) return;

    const channelName = (Math.random() + 1)
      .toString(36)
      .substring(4)
      .toUpperCase();
    const uid = Math.floor(100000000 + Math.random() * 900000000);
    const role = RtcRole.PUBLISHER;

    const expirationTimeInSeconds = 86400;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const generatedToken = RtcTokenBuilder.buildTokenWithUid(
      options.appId,
      options.primaryCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    navigator.clipboard.writeText(`${ENV_BASE_URL}/${channelName}`);

    createdClient.setClientRole(options.role);
    await createdClient.join(options.appId, channelName, generatedToken, uid);

    var audioTrack = await agoraRtc.createMicrophoneAudioTrack();
    setLocalAudioTrack(audioTrack);

    await createdClient.publish([audioTrack]);
  };

  const endLive = async () => {
    localAudioTrack?.close();
    client?.leave();
  };

  const onMicOpen = async () => {
    if (isLive) endLive();
    else startLive();

    setIsLive((prev) => !prev);
  };

  const onPreRecord = async () => {
    if (isRecording) {
      var [buffer, blob] = await recorder.stop().getAudio();
      const file = new File(buffer, 'me-at-thevoice.mp3', {
        type: blob.type,
        lastModified: Date.now(),
      });

      var createdRecordingResult = { ...recordingResult, file };
      setRecordingResult(createdRecordingResult);

      // TODO Integration
      const player = new Audio(URL.createObjectURL(file));
      player.play();
    } else {
      await recorder.start();
      setRecordingResult((prev) => {
        return {
          ...prev,
          timestamps: [],
        };
      });
    }

    setIsRecording((prev) => !prev);
  };

  useEffect(() => {
    if (!swiper) {
      return;
    }

    swiper.slideTo(activeSlide);
  }, [activeSlide, swiper]);

  return (
    <>
      <GlobalStyles />
      <Box
        sx={{
          height: '100%',
        }}
      >
        <SlideControls
          onPresent={(_event, status) => {
            setIsPresenting(status);
          }}
          onMicOpen={onMicOpen}
          onPreRecord={onPreRecord}
        />
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
          onSlideChange={(swiper) => {
            const slideIndex = swiper.activeIndex;
            handleOnSlideChange(slideIndex);
            recordSlideChange(slideIndex);
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
                p: ['30px', null, '56px'],
                alignItems: 'center',
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: 'clamp(1rem, 10vw, 6rem)',
                }}
              >
                Anong hayop si Karlito? 🐒
              </Typography>
              <Divider sx={{ width: '100%' }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px',
                  width: '100%',
                  height: '100%',
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
              <Typography
                variant="h3"
                textAlign="center"
                sx={{
                  fontSize: 'clamp(1rem, 10vw, 3rem)',
                }}
              >
                {`Nakita mo na umiiyak si Danica sa hallway. Nalaman mo na si Danica ay "Broken Hearted". Ano ang iyong gagawin?`}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: ['1fr', null, 'repeat(2, 1fr)'],
                  gap: '16px',
                  my: ['40px', null, '96px'],
                  mx: 'auto',
                }}
              >
                {questionChoices.map((questionChoice) => (
                  <Button
                    key={questionChoice}
                    // TODO
                    // disabled={!!selectedQuestionChoice}
                    variant={
                      questionChoice === selectedQuestionChoice
                        ? 'contained'
                        : 'outlined'
                    }
                    sx={{ textTransform: 'unset', fontSize: '24px', p: '16px' }}
                    onClick={() => setSelectedQuestionChoice(questionChoice)}
                  >
                    {questionChoice}
                  </Button>
                ))}
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
                - Your friends at&nbsp;
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
        </StyledSwiper>
        <IconButton
          ref={navPrevButtonRef}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 72,
            zIndex: 2,
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
        >
          <KeyboardArrowRightIcon />
        </IconButton>
      </Box>
    </>
  );
};
