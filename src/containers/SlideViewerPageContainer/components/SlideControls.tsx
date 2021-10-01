import React, { MouseEvent } from 'react';

import { Box } from '@mui/system';
import { Button, createTheme, IconButton, ThemeProvider } from '@mui/material';

import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SyncIcon from '@mui/icons-material/Sync';

const theme = createTheme({
  palette: {
    secondary: {
      main: 'rgb(235, 0, 20)',
    },
  },
});

export type SlideControlsProps = {
  onLeave?: JSX.IntrinsicElements['button']['onClick'];
  onSync?: JSX.IntrinsicElements['button']['onClick'];
};
export const SlideControls = ({ onLeave, onSync }: SlideControlsProps) => {
  const handleOnLeave = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onLeave) {
      return;
    }
    onLeave(event);
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
        <IconButton color="primary" onClick={onSync}>
          <SyncIcon />
        </IconButton>
        <Button
          variant="outlined"
          endIcon={<MeetingRoomIcon />}
          onClick={handleOnLeave}
        >
          Leave
        </Button>
      </Box>
    </ThemeProvider>
  );
};
