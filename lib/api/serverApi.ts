import { api } from "./api";
import { Story } from "@/types/story";


export async function fetchStories(page = 1, perPage = 3): Promise<Story[]> {
  const { data } = await api.get<{ stories: Story[] }>(
    `/stories?page=${page}&perPage=${perPage}`
  );
  return data.stories;
}



export async function addStoryToFavorites(storyId: string): Promise<void> {
  await api.post(`/stories/${storyId}/favorite`);
}


export async function removeStoryFromFavorites(storyId: string): Promise<void> {
  await api.delete(`/stories/${storyId}/favorite`);
}



