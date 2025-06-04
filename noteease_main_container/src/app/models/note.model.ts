export interface Note {
  id: string;
  title: string;
  content: string;
  categories: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
