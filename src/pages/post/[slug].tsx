import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client'

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  
  function countText() {
    let words = []
    words.push(post.data.title)
    post.data.content.map((item) => {
      words.push(item.heading.split(' ',))
      RichText.asText(item.body).split(' ',).map((text) => {
        words.push(text)
      })
    
    })
    return Math.ceil(Number(words.length / 200))
  }


  const router = useRouter()
  if (router.isFallback) {
    return <div>Carregando...</div>
  } else {
    return (
      <>
        <Header title={post.data.title} />
        <main className={commonStyles.media}>
          <section>
            <img className={styles.banner} src={post.data.banner.url} />
            <article className={styles.post}>
              <div className={styles.main}>
                <h1>{post.data.title}</h1>
                <div className={styles.info}>
                  <FiCalendar /><time>{format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })}</time>
                  <FiUser /><span>{post.data.author}</span>
                  <FiClock /><span>{countText()} min</span>
                </div>
                <div>
                  {post.data.content.map(content => (
                    <div key={content.heading}>
                      <h2>{content.heading}</h2>
                      <div
                        className={styles.content}
                        dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>
        </main>
      </>
    )
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(Prismic.Predicates.at('document.type', 'posts'))
  return {
    paths: posts.results.map((post) => {
      return { params: { slug: post.uid } }
    }),
    fallback: true,
  }

};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});
  const
    post = {
      data: {
        title: response.data.title,
        author: response.data.author,
        subtitle: response.data.subtitle,
        banner: {
          url: response.data.banner.url || null 
        },
        content: response.data.content
      },
      first_publication_date: response.first_publication_date,
      uid: response.uid,
    }



  return {
    props: {
      post,
    },
    redirect: 60 * 30
  }
};
