import React, { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

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

export const SlideViewerPageContainer = () => {
  const {
    push,
  } = useRouter();
  const navPrevButtonRef = useRef<HTMLButtonElement>(null);
  const navNextButtonRef = useRef<HTMLButtonElement>(null);

  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

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

  usePusherSubscribe(
    'slide-1',
    'event:slider-slide',
    (data: Record<'slideIndex', number>) => {
      setActiveSlide(data.slideIndex);
    },
  );

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
          onLeave={() => {
            push('/');
          }}
        />
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
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </StyledSwiper>
      </Box>
    </>
  );
};
