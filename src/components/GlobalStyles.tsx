import { GlobalStyles as MaterialGlobalStyles } from '@mui/material';

export const GlobalStyles = () => (
  <MaterialGlobalStyles
    styles={{
      html: {
        height: '100%',
      },
      body: {
        height: '100%',
      },
      '#__next': {
        height: '100%',
      }
    }}
  />
);
