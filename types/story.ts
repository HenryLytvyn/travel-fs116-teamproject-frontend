export type Story = {
    _id: string;
    img: string;
    title: string;
    article: string;
    category: string;
    author: Author;
    date: string;
    favoriteCount: number;
    isFavorite?: boolean;
}

export interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

// export interface FetchStoriesParams {
//     page?: number;
//     perPage?: number;
// }
    
// export interface FetchStoriesResponse {
//     page: number;
//     data: Story[];
//     total_pages: number;
//     perPage: number;
// }

// export interface RawFetchStoriesResponse {
//   stories: Story[];
//   totalPages: number;
// }