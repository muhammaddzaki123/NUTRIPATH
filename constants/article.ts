
export interface Article {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $collectionId: string;
  $databaseId: string;
  $permissions: string[];
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  viewCount: number;
}

export interface CreateArticleData {
  title: string;
  description: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  tags: string[];
  isPublished?: boolean;
  viewCount?: number;
}
