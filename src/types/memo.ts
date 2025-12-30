export interface Memo {
  id: string;
  title?: string;
  date?: string;
  author?: string;
  memoMarkdown: string;
}

export interface MemoKeyField {
  key: string;
  value: string;
}
