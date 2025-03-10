export type KaraokeVideo = {
  id: string;
  title: string;
  url: string;
  image: any;
};

export const karaokeVideos: KaraokeVideo[] = [

  // This is the list for Vimeo url implementation..
  { id: '1', title: 'Adele - Easy On Me', url: '896928254', image: require('../assets/images/flag_norway.png') },
  { id: '2', title: 'Red Hot Chili Peppers - Under the bridge', url: '533036203', image: require('../assets/images/flag_norway.png') },

  // This is the list for youtube video implementation..
    // { id: 'M7Qg5H0luo0', title: 'Adele - Easy On Me' },
    // { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
    // { id: 'L0MK7qz13bU', title: 'Let It Go', lrcFile: require('./lyrics/let_it_go.lrc') },
    // Add more videos as needed
];