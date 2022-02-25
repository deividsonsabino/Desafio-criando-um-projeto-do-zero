import Head from "next/head";
import Link from "next/link";

import styles from './header.module.scss'

interface HeaderProps {
  title: string;
}
export default function Header({ title }: HeaderProps) {
  return (
    <div className={styles.header}>
      <Head>
        <title>{title}</title>
      </Head>
      <Link href="/">
        <img src="/images/Logo.svg" alt="logo" />
      </Link>
    </div>
  )
}
