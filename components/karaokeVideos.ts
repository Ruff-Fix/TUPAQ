export type KaraokeVideo = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string; // Optional thumbnail URL
};

export const karaokeVideos: KaraokeVideo[] = [

  // This is the list for Vimeo url implementation..
  { 
    id: '1', 
    title: 'Adele - Easy On Me', 
    url: '896928254',
    thumbnailUrl: 'https://i.vimeocdn.com/video/1772440486-e0d7d10b22c9eba9640d4f0750d61da689a6c1497fc258834b0a2c7bb1991bea-d_640x360' 
  },
  { 
    id: '2', 
    title: 'Red Hot Chili Peppers - Under the bridge', 
    url: '533036203',
    // Add thumbnail URL if available
  },
  // This is the list for youtube video implementation..
    // { id: 'M7Qg5H0luo0', title: 'Adele - Easy On Me' },
    // { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
    // { id: 'L0MK7qz13bU', title: 'Let It Go', lrcFile: require('./lyrics/let_it_go.lrc') },
    // Add more videos as needed
];