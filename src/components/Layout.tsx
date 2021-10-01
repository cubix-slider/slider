import React, { ReactNode } from 'react';

import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export type LayoutProps = {
  children: ReactNode;
};
export const Layout = ({
  children,
}: LayoutProps) => (
  <>
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div">
          Slider
        </Typography>
      </Toolbar>
    </AppBar>
    {children}
  </>
);
