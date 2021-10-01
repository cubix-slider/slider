import '../styles/globals.css';
import type { AppProps } from 'next/app';

// // ! https://github.com/zeit/next.js/blob/master/errors/css-global.md
import 'swiper/swiper.min.css';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
