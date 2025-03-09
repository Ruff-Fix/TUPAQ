import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from "@/components/Themed";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import { Button, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator } from "react-native";
import * as Pitchy from 'pitchy';
import { Audio, ResizeMode, Video } from 'expo-av';
import { EssentiaWASM } from 'essentia.js';
import { KaraokeVideo, karaokeVideos  } from '../components/karaokeVideos';
import { WebView } from 'react-native-webview';
// import Constants from 'expo-constants';
// const vimeoApiKey = Constants.expoConfig?.extra?.vimeoApiKey

// interface VimeoFile {
//     quality: string;
//     link: string;
//   }
  
//   interface VimeoSize {
//     width: number;
//     link: string;
//   }
  
//   interface VimeoResponse {
//     files: VimeoFile[];
//     pictures: {
//       sizes: VimeoSize[];
//     };
//   }

type Lyric = {
    time: number;
    lyric: string;
    note: string | null;
};

// type VimeoLinkData = {
//     videoUrl: string | undefined;
//     thumbnailUrl: string | undefined;
//   };

// async function getVimeoLinks(videoId: string): Promise<VimeoLinkData> {
//     try {
//       const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
//         headers: {
//           'Authorization': `bearer ${vimeoApiKey}`,
//           'Content-Type': 'application/json',
//         },
//       });
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json() as VimeoResponse;
  
//       console.log('Full Vimeo API response:', JSON.stringify(data, null, 2));
  
//       const videoUrl = data.files.find(file => file.quality === 'hd')?.link;
//       const thumbnailUrl = data.pictures.sizes.find(size => size.width === 640)?.link;
//       return { videoUrl, thumbnailUrl };
//   } catch (error) {
//     console.error('Error fetching Vimeo data:', error);
//     return { videoUrl: undefined, thumbnailUrl: undefined };
//   }
// }

// function getVimeoLinks(url: string) {
//     return fetch(`https://player.vimeo.com/video/${url}/config`, {
//         headers: {
//           'Authorization': `bearer ${vimeoAccessToken}`,
//           'Content-Type': 'application/json',
//         },
//       })
//       .then(r => r.json())
//       .then(r => 
//         r.request.files.progressive as {
//           profile: number;
//           width: number;
//           mime: string;
//           fps: number;
//           url: string;
//           cdn: string;
//           quality: string;
//           id: number;
//           origin: string;
//           height: number;
//         }[]
//       )
//       .catch(error => {
//         console.error('Error fetching Vimeo links:', error);
//         return [];
//       });
// }

// function useVimeoUrl(url: string) {
//     const [vimeoUrl, setVimeoUrl] = useState<string | undefined>();
  
//     useEffect(() => {
//       getVimeoLinks(url).then(linkData => {
//         if (linkData && linkData.videoUrl) {
//           setVimeoUrl(linkData.videoUrl);
//         }
//       });
//     }, [url]);
  
//     return vimeoUrl;
//   }

interface VimeoFile {
  type: string;
  quality: string;
  link: string;
}

interface VimeoApiResponse {
  files: VimeoFile[];
}

const GameKaraoke: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const videoRef = useRef<Video | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const { language } = useLanguage();
    const [selectedVideo, setSelectedVideo] = useState<KaraokeVideo | null>(null);
    const lyricsRef = useRef<Lyric[]>([]);
    const currentLyricIndex = useRef<number>(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // const [karaokeVideos, setKaraokeVideos] = useState<KaraokeVideos[]>(initialKaraokeVideos);
    // const [ isPlaying, setIsPlaying] = useState<boolean>(false);
    // const videoId = selectedVideo?.url;

    const vimeoApiKey = '9a865bb872967a5912865f22b971cb4b';
    const privVimeoApiKey = '7d6b191090278962eb0cf853ff6c6f43';
    

    // useEffect(() => {
    //     // loadAudio();
    //     return () => {
    //       if (isRecording) {
    //         stopRecording();
    //       }
    //     };
    // }, []);
    
    //   useEffect(() => {
    //     if (selectedVideo) {
    //       const fetchVideoUrl = async (): Promise<void> => {
    //         try {
    //           // console.log('Expo Config Extra: ', Constants.expoConfig?.extra);
    //           // console.log('Vimeo API key: ', vimeoApiKey);
    //           console.log('Selected Video:', selectedVideo);
    //           console.log('Video ID:', videoId);
    //           const response: Response = await fetch(`https://api.vimeo.com/videos/${selectedVideo.url}`, {
    //             headers: {
    //               'Authorization': `Bearer ${privVimeoApiKey}`,
    //               'Content-Type': 'application/json',
    //               'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    //             },
    //           });

    //           if (!response.ok) {
    //             console.log("Selected url", selectedVideo)
    //             const errorText = await response.text();
    //             console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //           }
      
    //           const data: any = await response.json();
    //           const topLevelKeys = Object.keys(data);
    //           const topLevelData = topLevelKeys.reduce<Record<string, string | number | boolean>>((acc, key) => {
    //             acc[key] = typeof data[key] === 'object' ? '[Object]' : data[key];
    //             return acc;
    //           }, {});
    //           // console.log('Top-level Vimeo API response:', JSON.stringify(topLevelData, null, 2));
    //           // console.log('Vimeo API response:', JSON.stringify(data, null, 2));

    //           const files: VimeoFile[] = data.files;
    //           if (data.files && Array.isArray(data.files) && data.files.length > 0) {
    //             const mp4File = data.files.find((file: VimeoFile) => file.type === 'video/mp4' && file.quality === 'hd');
    //             if (mp4File) {
    //               setVideoUrl(mp4File.link);
    //             } else {
    //               console.error('No suitable MP4 file found');
    //               setVideoUrl(null);
    //             }
    //           } else {
    //             console.error('No files found in API response');
    //             setVideoUrl(null);
    //           }
    //           // if (data.files && Array.isArray(data.files) && data.files.length > 0) {
    //           //   const mp4File = data.files.find((file: VimeoFile) => file.type === 'video/mp4' && file.quality === 'hd');
    //           //   if (mp4File) {
    //           //     setVideoUrl(mp4File.link);
    //           //   } else {
    //           //     console.error('No suitable MP4 file found');
    //           //     setVideoUrl(null);
    //           //   }
    //           // } else {
    //           //   console.error('No files found in API response');
    //           //   setVideoUrl(null);
    //           // }
    //         } catch (error) {
    //           console.error('Error fetching video URL:', error);
    //         } finally {
    //           setLoading(false);
    //         }
    //       };
    //       fetchVideoUrl();
    //     }
    //   }, [videoId]);
    
      // if (loading) {
      //   return <ActivityIndicator size="large" color="#9000ff" />;
      // }
    
      // if (!videoUrl) {
      //   return (
      //     <View>
      //       <Text>Video not available</Text>
      //     </View>
      //   );
      // }
    
    //   const loadAudio = async (): Promise<void> => {
    //     const { sound } = await Audio.Sound.createAsync(
    //       require('../assets/karaoke_track.mp3')
    //     );
    //     await sound.playAsync();
    //   };

    useEffect(() => {
      if (selectedVideo) {
          fetchVideoUrl(selectedVideo.url);
          console.log('Video URL and selectedvid: ', videoUrl, selectedVideo);
      }
  }, [selectedVideo]);

  useEffect(() => {
      if (selectedVideo && isRecording) {
          if (videoRef.current) {
              videoRef.current.playAsync();
          }
      } else if (!isRecording) {
          if (videoRef.current) {
              videoRef.current.pauseAsync();
          }
      }
  }, [selectedVideo, isRecording]);

  const fetchVideoUrl = async (video_id: string) => {
      setLoading(true);
      try {
          const response = await fetch(`https://api.vimeo.com/videos/${video_id}`, {
              headers: {
                  'Authorization': `Bearer ${privVimeoApiKey}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/vnd.vimeo.*+json;version=3.4'
              },
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('Top-level API response keys:', Object.keys(data));
          // console.log('Embed data:', JSON.stringify(data.play, null, 2));
          console.log('Link: ', data.uri);
          console.log('Testing api:', data.uri);
          // console.log('Full API response:', JSON.stringify(data, null, 2));

        if (data.link) {
          console.log('Video URL:', data.link);
          setVideoUrl(data.link);
        // if (data.player_embed_url) {
        //   console.log('Video URL:', data.player_embed_url);
        //   setVideoUrl(data.player_embed_url);
      } else {
          console.error('No suitable video URL found');
          setVideoUrl(null);
      }
      } catch (error) {
          console.error('Error fetching video URL:', error);
          setVideoUrl(null);
      } finally {
          setLoading(false);
      }
  };
    
      const startRecording = async (): Promise<void> => {
        try {
          await Audio.requestPermissionsAsync();
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
          await recording.startAsync();
          recordingRef.current = recording;
          setIsRecording(true);
        } catch (error) {
          console.error('Failed to start recording', error);
        }
      };

      const stopRecording = async (): Promise<void> => {
        try {
          if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            setIsRecording(false);
            // if (uri) {
            //   await compareVocals(uri);
            // }
          }
        } catch (error) {
          console.error('Failed to stop recording', error);
        }
      };
    
    //   const compareVocals = async (userAudioUri: string): Promise<void> => {
    //     const essentia = await EssentiaWASM.init();
    //     const userAudio = await fetch(userAudioUri).then(r => r.arrayBuffer());
    //     const originalVocal = await fetch(require('../assets/original_vocal.mp3')).then(r => r.arrayBuffer());
    
    //     const userPitchData = Pitchy.PitchDetector.forFloat32Array(new Float32Array(userAudio) as unknown as number);
    //     const originalPitchData = Pitchy.PitchDetector.forFloat32Array(new Float32Array(originalVocal) as unknown as number);
    
    //     const pitchSimilarity = essentia.PitchContourSimilarity(userPitchData, originalPitchData);
    //     const userKey = essentia.KeyExtractor(new Float32Array(userAudio));
    
    //     const newScore = calculateScore(pitchSimilarity, userKey);
    //     setScore(newScore);
    //   };
    
      const calculateScore = (pitchSimilarity: number, userKey: any): number => {
        return Math.round(pitchSimilarity * 100);
      };

      const renderItem = ({ item }: { item: KaraokeVideo }) => (
        // <TouchableOpacity onPress={() => setSelectedVideo(item)} style={styles.videoItem}>
        //     <Text style={styles.videoTitle}>{item.title}</Text>
        // </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSelectedVideo(item)}
          style={[styles.videoItem, selectedVideo?.id === item.id && styles.selectedVideoItem]}
        >
        <Text style={[styles.videoTitle, selectedVideo?.id === item.id && styles.selectedVideoTitle]}>
                {item.title}
            </Text>
    </TouchableOpacity>
    );

      return (
        <View style={styles.container}>
          <Text style={styles.title}>{i18next.t('karaoke')}</Text>
            <View style={styles.videoContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#9000ff" />
                ) : videoUrl ? (
                    <Video
                        // ref={(ref: Video) => { videoRef.current = ref; }}
                        ref={videoRef}
                        source={{ uri: videoUrl }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        style={{ width: 300, height: 200 }}
                        shouldPlay={isRecording}
                        isLooping={false}
                        onError={(error) => console.error('Video playback error:', error)}
                    />
                    // <WebView
                    //     source={{ uri: videoUrl }}
                    //     style={{ width: 300, height: 200 }}
                    //     javaScriptEnabled={true}
                    //     domStorageEnabled={true}
                    //     startInLoadingState={true}
                    //     scalesPageToFit={true}
                    //     onError={(syntheticEvent) => {
                    //         const { nativeEvent } = syntheticEvent;
                    //         console.error('WebView error: ', nativeEvent);
                    //     }}
                    // />
                ) : (
                    <Text>Select a video to play</Text>
                )}
            </View>
            <View style={styles.videosListContainer}>
                <FlatList
                    data={karaokeVideos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    style={styles.videosList}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <Button 
                    title={isRecording ? "Stop Singing" : "Start Singing"} 
                    onPress={isRecording ? stopRecording : startRecording}
                    disabled={!videoUrl} 
                />
                <Text>Score: {score}</Text>
            </View>
            {/* <Text style={styles.title}>{i18next.t('karaoke')}</Text>
            <View style={styles.videoContainer}>
            {videoUrl && (
                <Video
                    source={{ uri: videoUrl }}
                    useNativeControls
                    // resizeMode={'contain'}
                    style={{ width: 300, height: 200 }}
                />
            )}
            </View>
            <View style={styles.videosListContainer}>
                <FlatList
                    data={karaokeVideos}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    style={styles.videosList}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
                <Button 
                    title={isRecording ? "Stop Singing" : "Start Singing"} 
                    onPress={isRecording ? stopRecording : startRecording} 
                />
                <Text>Score: {score}</Text>
            </View> */}
            
                {/* {selectedVideo ? (
                    <>
                        <YoutubePlayer
                            height={200}
                            width={300}
                            play={true}
                            videoId={selectedVideo.id}
                            onReady={() => setIsRecording(false)}
                            forceAndroidAutoplay
                            initialPlayerParams={{
                                preventFullScreen: true,
                                controls: false,
                                modestbranding: true,
                                rel: false,
                                start: 1,
                                // contentCheckOk: true,
                                iv_load_policy: 3
                            }}
                            webViewProps={{
                                androidLayerType: 'hardware',
                            }}
                            onError={(error) => console.error("YouTube Player Error:", error)}
                        />
                        
                        <Button 
                            title={isRecording ? "Stop Singing" : "Start Singing"} 
                            onPress={isRecording ? stopRecording : startRecording} 
                        />
                    </> ) : (
                    <>
                        <FlatList
                            data={karaokeVideos}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                        />
                        <Text>Score: {score}</Text>
                    </>
                )} */}
        </View>
      );
};

// const audioRecorderPlayer = new AudioRecorderPlayer();
// const pitchDetector = PitchDetector.forFloat32Array(2048);

// const GameKaraoke = () => {
//     const { language } = useLanguage();
//     const [selectedVideo, setSelectedVideo] = useState<KaraokeVideos | null>(null);
//     const [score, setScore] = useState<number>(0);
//     const [isRecording, setIsRecording] = useState<boolean>(false);
//     const youtubeRef = useRef<any>(null);
//     const lyricsRef = useRef<Lyric[]>([]);
//     const currentLyricIndex = useRef<number>(0);


//     const parseLRC = (lrcContent: string) => {
//         const lines = lrcContent.split('\n');
//         const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
//         const noteRegex = /\[(\w#?\d)\]/;
//         const result: Lyric[] = [];

//         lines.forEach(line => {
//             const timeMatch = line.match(timeRegex);
//             if (timeMatch) {
//                 const [, minutes, seconds, milliseconds] = timeMatch;
//                 const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / (milliseconds.length === 2 ? 100 : 1000);

//                 const noteMatch = line.match(noteRegex);
//                 const note = noteMatch ? noteMatch[1] : null;

//                 const lyric = line.replace(timeRegex, '').replace(noteRegex, '').trim();

//                 result.push({ time, lyric, note });
//             }
//         });

//         return result;
//     };

//     const startRecording = async () => {
//         setIsRecording(true);
//         await audioRecorderPlayer.startRecorder();
//         audioRecorderPlayer.addRecordBackListener((e: any) => {
//             const { currentPosition, currentMetering } = e;
//             const [pitch] = pitchDetector.findPitch(new Float32Array([currentMetering]), 44100);

//             const currentLyric = lyricsRef.current[currentLyricIndex.current];
//             if (currentLyric && currentLyric.note && Math.abs(currentPosition / 1000 - currentLyric.time) < 0.5) {
//                 const expectedNote = noteToFrequency(currentLyric.note);
//                 const pitchAccuracy = 1 - Math.abs(pitch - expectedNote) / expectedNote;
//                 const timingAccuracy = 1 - Math.abs(currentPosition / 1000 - currentLyric.time) / 0.5;
//                 const lineScore = (pitchAccuracy + timingAccuracy) * 50;
//                 setScore(prevScore => prevScore + lineScore);
//                 currentLyricIndex.current++;
//             }
//         });
//     };

//     const stopRecording = async () => {
//         setIsRecording(false);
//         await audioRecorderPlayer.stopRecorder();
//         audioRecorderPlayer.removeRecordBackListener();
//     };

//     const noteToFrequency = (note: string): number => {
//         const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
//         const octave = parseInt(note.slice(-1));
//         const noteName = note.slice(0, -1);
//         const semitone = notes.indexOf(noteName);

//         if (semitone === -1) {
//             throw new Error(`Invalid note: ${note}`);
//         }

//         // A4 is 440 Hz
//         const A4 = 440;
//         const A4_INDEX = notes.indexOf('A') + (4 * 12);
//         const noteIndex = semitone + (octave * 12);
//         const halfSteps = noteIndex - A4_INDEX;

//         return A4 * Math.pow(2, halfSteps / 12);
//     };

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'Rowdies',
        fontSize: 30,
    },
    videoContainer: {
        marginVertical: 20,
        width: '80%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoTitle: {
        fontSize: 18,
        padding: 10,
    },
    videosListContainer: {
        width: '90%',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videosList: {
        display: 'flex',
        width: '100%',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        margin: 10,
    },
    videoItem: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
    },
    score: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
    },
    selectedVideoItem: {
      backgroundColor: '#e0e0e0',
  },
  selectedVideoTitle: {
      fontWeight: 'bold',
      color: '#9000ff',
  },
});

export default GameKaraoke;