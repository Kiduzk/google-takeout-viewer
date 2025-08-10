export interface YoutubeVideo {
  id: number;
  title: string;
  titleUrl: string;
  time: string;
  details: string[];
}

export interface YoutubeComment {
  id: number;
  videoId: string;
  channelId: string;
  commentId: string;
  text: string;
  time: string;
}

export interface KeepListContent {
  textHtml: string;
  text: string;
  isChecked: boolean;
}

export interface KeepAnnotation {
  description: string;
  source: string;
  title: string;
  url: string;
}

export interface KeepEntry {
  id: number;
  title: string;
  userEditedTimestampUsec: string;
  createdTimestampUsec: string;
  listContent: KeepListContent[];
  textContent: string;
  textContentHtml: string;
  color: string;
  annotations: KeepAnnotation[];
  isTrashed: boolean;
  isPinned: boolean;
  isArchived: boolean;
}
