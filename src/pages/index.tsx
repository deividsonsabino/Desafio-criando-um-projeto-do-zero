import { GetStaticProps } from 'next';

import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client'

import { FiCalendar, FiUser } from 'react-icons/fi'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPaginatione }: HomeProps) {
  return (
    <>
      <Head>
        <title>
          Home - spacetraveling
        </title>
      </Head>
      <main className={styles.container}>
        <section>
          <img
            src="/images/Logo.svg"
            alt="logo"

          />
          {postsPaginatione.results.map(post => (
            <Link href={`post/${post.uid}`}>
              <a href="#">
                <div className={styles.posts}>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.info}>
                    <FiCalendar /><time>{post.first_publication_date}</time>
                    <FiUser /><span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {postsPaginatione.next_page !== null && (
            <button>Carregar mais posts</button>
          )}
        </section>
      </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [],
    pageSize: 2
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.last_publication_date),"dd MMM yyyy", { locale: ptBR }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const next_page = postsResponse.next_page

  const postsPaginatione = {
    next_page,
    results
  }

  return {
    props: { postsPaginatione }
  }

};
