import { useEffect, useState } from 'react';
import TravellersStories from '../TravellersStories/TravellersStories';
import css from './Popular.module.css';
import { fetchStories } from '@/lib/api/serverApi';
import { Story } from '@/types/story';


interface PopularProps {
  isAuthenticated: boolean;
}

export default function Popular({ isAuthenticated }: PopularProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadStories = async () => {
    try {
      setLoading(true);
      const newStories = await fetchStories(page, 3);
      if (newStories.length === 0) {
        setHasMore(false);
      } else {
        setStories(prev => [...prev, ...newStories]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [page]);

  return (
    <section className="stories">
      <div className="container">
        <h2 className={css.stories__title}>Популярні історії</h2>
        <TravellersStories stories={stories} isAuthenticated={isAuthenticated} />
        {hasMore && (
        <div className={css.stories__footer}>
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={loading}
            className={css.stories__more}
          >
            {loading ? 'Завантаження...' : 'Переглянути всі'}
          </button>
        </div>
      )}
      </div>
    </section>
  );
}