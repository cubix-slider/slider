import React, { MouseEvent, useState } from 'react';

import { Box } from '@mui/system';
import { IconButton, Button, createTheme, ThemeProvider } from '@mui/material';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AlbumIcon from '@mui/icons-material/Album';
import MicIcon from '@mui/icons-material/Mic';

const theme = createTheme({
  palette: {
    secondary: {
      main: 'rgb(235, 0, 20)',
    },
  },
});

export type SlideControlsProps = {
  onPresent?: JSX.IntrinsicElements['button']['onClick'];
  onPreRecord?: JSX.IntrinsicElements['button']['onClick'];
  onMicOpen?: JSX.IntrinsicElements['button']['onClick'];
};
export const SlideControls = ({
  onPresent,
  onPreRecord,
  onMicOpen,
}: SlideControlsProps) => {
  const [isPresenting, setIsPresenting] = useState(false);
  const [isPreRecording, setIsPreRecording] = useState(false);
  const [isMicOpen, setIsMicOpen] = useState(false);

  const handleOnClickPreRecording = (event: MouseEvent<HTMLButtonElement>) => {
    setIsPreRecording((prev) => !prev);

    if (!onPreRecord) {
      return;
    }

    onPreRecord(event);
  };

  const handleOnMicOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setIsMicOpen((prev) => !prev);

    if (!onMicOpen) {
      return;
    }

    onMicOpen(event);
  };

  const handleOnClickPresent = (event: MouseEvent<HTMLButtonElement>) => {
    setIsPresenting((prev) => !prev);

    if (!onPresent) {
      return;
    }
    onPresent(event);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'absolute',
          right: '24px',
          top: '24px',
          // On top of swiper slide
          zIndex: 2,
        }}
      >
        <IconButton
          onClick={handleOnClickPreRecording}
          {...(isPreRecording && {
            color: 'secondary',
          })}
          {...(isPresenting && {
            disabled: true,
          })}
        >
          <AlbumIcon />
        </IconButton>
        <IconButton
          onClick={handleOnMicOpen}
          {...(isMicOpen && {
            color: 'secondary',
          })}
        >
          <MicIcon />
        </IconButton>

        <Button
          variant="outlined"
          {...(isPresenting && {
            color: 'secondary',
            variant: 'contained',
          })}
          {...(!isPresenting && {
            endIcon: <PlayArrowIcon />,
          })}
          {...(isPreRecording && {
            disabled: true,
          })}
          onClick={handleOnClickPresent}
        >
          {isPresenting ? 'Live' : 'Present live'}
        </Button>
      </Box>
    </ThemeProvider>
  );
};
