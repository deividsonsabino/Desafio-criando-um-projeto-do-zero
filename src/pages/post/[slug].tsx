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
import { Comments } from '../../components/Comments';
import Link from 'next/link';

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
  preview: boolean;
  next: PostNavigation;
  previous: PostNavigation;
}

interface PostNavigation {
  data: {
    title: string
  };
  uid: string;
}

export default function Post({ post, preview, next, previous }: PostProps) {

  function countText() {
    let words = []
    words.push(post.data.title)
    post.data.content.map((item) => {
      if (item.heading) {
        words.push(item.heading.split(' ',))
        RichText.asText(item.body).split(' ',).map((text) => {
          words.push(text)
        })
      }
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
              <hr></hr>
              <div className={styles.postNavigation}>
                {previous ? (
                  <>
                    <div>
                      <p>{previous.data.title}</p>
                      <Link href={`/post/${previous.uid}`}>Post Anterior</Link>
                    </div>
                    <div>

                    </div>
                  </>

                ) : next && (
                  <>
                    <div>

                    </div>
                    <div>
                      <p>{next.data.title}</p>
                      <Link href={`/post/${next.uid}`}>Próximo Post</Link>
                    </div>

                  </>
                )}
              </div>
              {preview !== true && (
                <Comments />
              )}
              {preview && (
                <aside className={styles.preview}>
                  <Link href="/api/exit-preview">
                    <a>Sair do modo Preview</a>
                  </Link>
                </aside>
              )}
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

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

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

  const previous = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    })

  const next = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date desc]',
    })

  return {
    props: {
      post,
      preview,
      previous: previous.results[0] ?? null,
      next: next.results[0] ?? null
    },
    redirect: 60 * 30
  }
};
