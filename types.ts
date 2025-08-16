
export interface StoryContent {
  topic: string;
  title: string;
  tableOfContents: string[];
  story: string;
  imageUrl: string;
  nextTopics?: string[];
}

export interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'error' | 'success';
}
