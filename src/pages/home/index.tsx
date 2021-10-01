import React, { ReactNode } from 'react';

import NextLink, { LinkProps as NextLinkProps } from 'next/link';

import { Grid, Link as MaterialLink, Paper } from '@mui/material';

import { Layout } from '../../components/Layout';

type LinkProps = NextLinkProps & {
  children: ReactNode;
};
const Link = ({
  children,
  ...rest
}: LinkProps) => (
  <NextLink
    {...rest}
    passHref
  >
    <MaterialLink>
      {children}
    </MaterialLink>
  </NextLink>
);

const PresenterHome = () => {
  return (
    <Layout>
      <Grid container spacing={2} sx={{ p: '80px' }}>
        <Grid item xs={6}>
          <Link
            href="home/p/1/edit"
          >
            <Paper sx={{
              height: '250px',
              width: '250px',
            }}>
              Slide 1
            </Paper>
          </Link>
        </Grid>
        <Grid item xs={6}>
          <Link
            href="home/p/1/edit"
          >
            <Paper sx={{
              height: '250px',
              width: '250px',
            }}>
              Slide 1
            </Paper>
          </Link>
        </Grid>
        <Grid item xs={6}>
          <Link
            href="home/p/1/edit"
          >
            <Paper sx={{
              height: '250px',
              width: '250px',
            }}>
              Slide 1
            </Paper>
          </Link>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default PresenterHome;
