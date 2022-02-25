import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client'

import { FiCalendar, FiUser } from 'react-icons/fi'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';
import Post from './post/[slug]';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPost] = useState<Post[]>(postsPagination.results)
  const [next_page, setNextPage] = useState(postsPagination.next_page)


  async function loadMorePostsButton(endpoint) {
    const res = await fetch(endpoint)
    const post = await res.json()
    let newPosts = [...posts]
    newPosts.push(post.results[0])
    setPost(newPosts)
    setNextPage(post.next_page)
  }

  useEffect(() => {
    loadMorePostsButton
  },[posts])

  return (
    <>
      <Head>
        <title>
          Home - spacetraveling
        </title>
      </Head>
      <main className={commonStyles.media}>
        <section className={styles.container}>
          <img
            src="/images/Logo.svg"
            alt="logo"

          />
          {posts.map(post => (
            <Link key={post.uid} href={`post/${post.uid}`}>
              <a href="#">
                <div className={styles.posts}>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.info}>
                    <FiCalendar /><time>{format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })}</time>
                    <FiUser /><span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {next_page !== null && (
            <button onClick={() => loadMorePostsButton(postsPagination.next_page)}>
              Carregar mais posts
            </button>

          )}
        </section>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [],
    pageSize: 1
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const next_page = postsResponse.next_page

  const postsPagination = {
    next_page,
    results
  }

  return {
    props: { postsPagination }
  }

};

