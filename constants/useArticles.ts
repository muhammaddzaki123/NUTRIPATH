import { useEffect, useState } from 'react';
import { getArticles } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { createArticleNotification } from '@/lib/notification-service';
import { Article } from './article';

interface UseArticlesResult {
  articles: Article[];
  loading: boolean;
  error: string | null;
  searchArticles: (query: string) => void;
  filteredArticles: Article[];
}

export const useArticles = (): UseArticlesResult => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedArticles = await getArticles();
        const publishedArticles = (fetchedArticles as Article[]).filter(
          article => article.isPublished
        );
        
        // Check for new articles since last fetch
        if (lastFetchTime && user) {
          const newArticles = publishedArticles.filter(article => 
            article.$createdAt && new Date(article.$createdAt) > lastFetchTime
          );

          // Create notifications for new articles
          for (const article of newArticles) {
            try {
              await createArticleNotification(
                article.$id,
                article.title,
                article.description,
                [user.$id]
              );
            } catch (notifError) {
              console.error('Error creating article notification:', notifError);
            }
          }
        }

        setArticles(publishedArticles);
        setFilteredArticles(publishedArticles);
        setLastFetchTime(new Date());
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling for new articles every 5 minutes
    const pollInterval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(pollInterval);
  }, [user, lastFetchTime]);

  const searchArticles = (query: string): void => {
    if (!query.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const searchQuery = query.toLowerCase().trim();
    const filtered = articles.filter((article: Article) => {
      const titleMatch = article.title.toLowerCase().includes(searchQuery);
      const descriptionMatch = article.description.toLowerCase().includes(searchQuery);
      const contentMatch = article.content.toLowerCase().includes(searchQuery);
      const categoryMatch = article.category.toLowerCase().includes(searchQuery);
      const tagsMatch = article.tags.some((tag: string) => 
        tag.toLowerCase().includes(searchQuery)
      );

      return titleMatch || descriptionMatch || contentMatch || categoryMatch || tagsMatch;
    });

    setFilteredArticles(filtered);
  };

  return {
    articles,
    loading,
    error,
    searchArticles,
    filteredArticles
  };
};
