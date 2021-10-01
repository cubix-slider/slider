import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Cubix Slider</title>
        <meta name="description" content="An interactive way to create presentations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://cubix-slider.vercel.app/home/p/1/edit">Cubix Slider</a>
        </h1>

      </main>
    </div>
  )
} 

export default Home
