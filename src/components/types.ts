export interface Photo {
  id: string;
  url: string;
  author: string;
  timestamp: Date;
  hidden: boolean;
  aspectRatio: number;
  accentColor?: string;
  x?: number;
  y?: number;
  rotation?: number;
}

export function isUserPhoto(id: string): boolean {
  return id.startsWith("user-");
}
