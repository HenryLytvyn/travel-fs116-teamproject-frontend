'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Story } from '@/types/story';
import { addStoryToFavorites, removeStoryFromFavorites } from '@/lib/api/serverApi';

interface TravellersStoriesItemProps {
  story: Story;
  isAuthenticated: boolean;
}

export default function TravellersStoriesItem({ story, isAuthenticated }: TravellersStoriesItemProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(story.isFavorite ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(story.favoriteCount);

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push('/auth/register');
      return;
    }

    try {
      setIsSaving(true);
      if (!isSaved) {
        await addStoryToFavorites(story._id);
        setFavoriteCount(prev => prev + 1);
        setIsSaved(true);
        toast.success('Додано до збережених!');
      } else {
        await removeStoryFromFavorites(story._id);
        setFavoriteCount(prev => prev - 1);
        setIsSaved(false);
        toast('Видалено із збережених');
      }
    } catch (error) {
        console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="">
      <Image src={story.img} alt={story.title} width={400} height={250} className="" />

      <div className="">
        <div>
          <p className="">{story.category}</p>
          <h3 className="">{story.title}</h3>
          <p className="">{story.article}</p>
              </div>
                <div className="story__author">
      <Image src={story.author.avatarUrl} alt="Автор" className="story__avatar" />
      <div className="story__info">
        <p className="story__name">{story.author.name}</p>
                      <p className="story__meta">{story.date} • {story.favoriteCount}</p>
      </div>
    </div>
<div className="">
          <button
            onClick={() => router.push(`/stories/${story._id}`)}
            className=""
          >
            Переглянути статтю
          </button>

          <div className="">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className=""
            >
              {isSaved ? '★' : '☆'}
            </button>
            <span className="">{favoriteCount}</span>
          </div>
        </div>
      </div>
    </li>
  );
};