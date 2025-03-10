import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from "@/components/Themed";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import { Button, StyleSheet, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Image } from "react-native";
import * as Pitchy from 'pitchy';
// import { Audio, ResizeMode, Video } from 'expo-av';
import { Audio } from 'expo-av';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { EssentiaWASM } from 'essentia.js';
import { KaraokeVideo, karaokeVideos  } from '../components/karaokeVideos';
import { WebView } from 'react-native-webview';

const ResizeMode = {
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
};
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
    // const videoRef = useRef<Video | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const { language } = useLanguage();
    const [selectedVideo, setSelectedVideo] = useState<KaraokeVideo | null>(null);
    const lyricsRef = useRef<Lyric[]>([]);
    const currentLyricIndex = useRef<number>(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    // const [karaokeVideos, setKaraokeVideos] = useState<KaraokeVideos[]>(initialKaraokeVideos);
    // const [ isPlaying, setIsPlaying] = useState<boolean>(false);
    // const videoId = selectedVideo?.url;

    const vimeoApiKey = '9a865bb872967a5912865f22b971cb4b';
    const privVimeoApiKey = '7d6b191090278962eb0cf853ff6c6f43';
 
    
    //   const loadAudio = async (): Promise<void> => {
    //     const { sound } = await Audio.Sound.createAsync(
    //       require('../assets/karaoke_track.mp3')
    //     );
    //     await sound.playAsync();
    //   };

    // Create a player instance - initially null
    const player = useVideoPlayer(null, player => {
        // Setup the player when it's created
        player.loop = false;
    });
    
    // Get current playing state from the player
    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    useEffect(() => {
        if (selectedVideo) {
            fetchVideoUrl(selectedVideo.url);
            console.log('Video URL and selectedvid: ', videoUrl, selectedVideo);
        }
    }, [selectedVideo]);

    // useEffect(() => {
    //     if (selectedVideo && isRecording) {
    //         if (videoRef.current) {
    //             videoRef.current.playAsync();
    //         }
    //     } else if (!isRecording) {
    //         if (videoRef.current) {
    //             videoRef.current.pauseAsync();
    //         }
    //     }
    // }, [selectedVideo, isRecording]);
    // Control playback based on recording state
    useEffect(() => {
        if (isRecording && player) {
            player.play();
        } else if (!isRecording && player) {
            player.pause();
        }
    }, [isRecording, player]);

    const fetchVideoUrl = async (video_id: string) => {
        setLoading(true);
        try {
            // const response = await fetch(`https://api.vimeo.com/videos/${video_id}`, {
            //     headers: {
            //         'Authorization': `Bearer ${privVimeoApiKey}`,
            //         'Content-Type': 'application/json',
            //         'Accept': 'application/vnd.vimeo.*+json;version=3.4'
            //     },
            // });
            // This endpoint will get the config which contains playable video URLs
            const response = await fetch(`https://player.vimeo.com/video/${video_id}/config`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Top-level API response keys:', Object.keys(data));
            console.log('Config response retrieved');

            // Get the progressive video streams from the response
            const progressive = data.request?.files?.progressive;
            
            if (progressive && Array.isArray(progressive) && progressive.length > 0) {
                // Sort by quality and pick the highest quality
                const sortedStreams = progressive.sort((a, b) => b.height - a.height);
                const videoStreamUrl = sortedStreams[0].url;
                
                console.log('Video stream URL:', videoStreamUrl);
                setVideoUrl(videoStreamUrl);
            } else {
                console.error('No progressive streams found in the response');
                setVideoUrl(null);
            }

            // if (data.link) {
            // console.log('Video URL:', data.link);
            // setVideoUrl(data.link);
            // } else {
            //     console.error('No suitable video URL found');
            //     setVideoUrl(null);
            // }
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
        <TouchableOpacity 
          onPress={() => setSelectedVideo(item)}
          style={[styles.videoItem, selectedVideo?.id === item.id && styles.selectedVideoItem]}
        >
            <View style={styles.videoItemLeft}>
            <Image 
                source={item.image} 
                style={styles.videoItemImage}
                resizeMode="cover"
            />
        </View>
        <View style={styles.videoItemRight}>
            <Text style={[
                styles.videoTitle, 
                selectedVideo?.id === item.id && styles.selectedVideoTitle
            ]}>
                {item.title}
            </Text>
        </View>
        </TouchableOpacity>
    );

      return (
        <View style={styles.container}>
          <Text style={styles.title}>{i18next.t('karaoke')}</Text>
            <View style={styles.videoContainer}>
                {selectedVideo && loading ? (
                    <ActivityIndicator size="large" color="#9000ff" />
                ) : videoUrl ? (
                    <VideoView
                        player={player}
                        style={{ width: 300, height: 200 }}
                        contentFit="contain"
                        nativeControls={true}
                    />
                    // <VideoView
                    //     // ref={(ref: Video) => { videoRef.current = ref; }}
                    //     // ref={videoRef}
                    //     source={{ uri: videoUrl }}
                    //     useNativeControls
                    //     resizeMode={ResizeMode.CONTAIN}
                    //     style={{ width: 300, height: 200 }}
                    //     shouldPlay={isRecording}
                    //     isLooping={false}
                    //     onError={(error) => console.error('Video playback error:', error)}
                    // />
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
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoTitle: {
        fontSize: 14,
        padding: 10,
    },
    videosListContainer: {
        width: '90%',
        height: '50%',
        alignItems: 'center',
        // justifyContent: 'center'
    },
    videosList: {
        display: 'flex',
        width: '100%',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#9000ff',
        borderRadius: 5,
        margin: 10,
    },
    videoItem: {
        flexDirection: 'row',
        padding: 5,
        alignItems: 'center',
    },
    videoItemLeft: {
        flex: 0.15, // Takes 20% of the space
    },
    videoItemRight: {
        flex: 0.85, // Takes 80% of the space
        alignItems: 'center',
    },
    videoItemImage: {
        width: 45,
        height: 45,
        borderRadius: 3
    },
    score: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#9000ff',
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