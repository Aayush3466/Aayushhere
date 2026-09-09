/** Owner-only rows the Studio reads directly, kept in database shape. */

export interface InboxMessage {
  id: string;
  name: string;
  email: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface ScoreRow {
  id: string;
  game: "words" | "code";
  name: string;
  location: string | null;
  wpm: number;
  accuracy: number;
  seconds: number;
  created_at: string;
}
