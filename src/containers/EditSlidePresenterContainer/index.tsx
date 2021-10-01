import React, { useRef, useState } from 'react';

import SwiperCore, { Navigation, Keyboard } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Box, styled } from '@mui/system';
import { Typography, IconButton } from '@mui/material';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { GlobalStyles } from '../../components/GlobalStyles';
import { SlideControls } from './components/SlideControls';

import { ENV_BASE_URL } from '../../constants/envs';

SwiperCore.use([Navigation, Keyboard]);

const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;
`;

export const EditSlidePresenterPageContainer = () => {
  const navPrevButtonRef = useRef<HTMLButtonElement>(null);
  const navNextButtonRef = useRef<HTMLButtonElement>(null);
  
  const [isPresenting, setIsPresenting] = useState(false);

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slideIndex }),
      });
    } catch (error) {
      console.log('error', error); 
    }
  };

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
        />
        <StyledSwiper
          onBeforeInit={onBeforeInit}
          spaceBetween={50}
          slidesPerView={1}
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
