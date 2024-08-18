import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from "@/components/Themed";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import { Button, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import * as Pitchy from 'pitchy';
import { Audio, ResizeMode, Video } from 'expo-av';
import { EssentiaWASM } from 'essentia.js';
import { karaokeVideos } from '../components/karaokeVideos';
import { google } from 'googleapis';
import Constants from 'expo-constants';
const youtubeApiKey = Constants.expoConfig?.extra?.youtubeApiKey;

const youtube = google.youtube({
    version: 'v3',
    auth: youtubeApiKey,
  });

// const dummyKaraokeVideos = [
//     { id: 'M7Qg5H0luo0', title: 'Adele - Easy On Me' },
//     { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
// ]

// type KaraokeVideos = {
//     id: string;
//     title: string;
//     lrcFile: string;
// };

type KaraokeVideos = {
    id: string;
    title: string;
};

type Lyric = {
    time: number;
    lyric: string;
    note: string | null;
};

const GameKaraoke: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const videoRef = useRef<Video | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const { language } = useLanguage();
    const [selectedVideo, setSelectedVideo] = useState<KaraokeVideos | null>(null);
    const lyricsRef = useRef<Lyric[]>([]);
    const currentLyricIndex = useRef<number>(0);
    const [streamUrl, setStreamUrl] = useState<string | null>(null);

    const getVideoStreamUrl = async (videoId: string) => {
        try {
          const response = await youtube.videos.list({
            part: ['player'],
            id: [videoId]
          });
          const playerHtml = response.data.items?.[0]?.player?.embedHtml ??  '';
          // Extract the stream URL from the player HTML
          // This is a simplified example and may need adjustment
          const match = playerHtml.match(/src="([^"]+)"/);
          return match ? match[1] : null;
        } catch (error) {
          console.error('Error fetching video details:', error);
          return null;
        }
      };
    

    useEffect(() => {
        if (selectedVideo) {
            getVideoStreamUrl(selectedVideo.id)
            .then(url => {
                if (url) {
                    setStreamUrl(url);
                }
            })
            .catch(error => {
                console.error('Error fetching video stream URL:', error);
            });
        }
        // loadAudio();
        return () => {
          if (isRecording) {
            stopRecording();
          }
        };
      }, [selectedVideo]);
    
    //   const loadAudio = async (): Promise<void> => {
    //     const { sound } = await Audio.Sound.createAsync(
    //       require('../assets/karaoke_track.mp3')
    //     );
    //     await sound.playAsync();
    //   };
    
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

      const renderItem = ({ item }: { item: KaraokeVideos }) => (
        <TouchableOpacity onPress={() => setSelectedVideo(item)}>
            <Text style={styles.videoTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

      return (
        <View style={styles.container}>
          <Text style={styles.title}>{i18next.t('karaoke')}</Text>
          <View style={styles.videoContainer}>
            {selectedVideo ? (
                <>
                { streamUrl && (
                    <Video
                        ref={videoRef}
                        // source={{ uri: `https://www.youtube.com/embed/${selectedVideo.id}` }}
                        source={{ uri: `https://www.youtube.com/watch?v=${selectedVideo.id}` }}
                        style={{ width: 300, height: 200 }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        onError={(error) => console.error('Video Error:', error)}
                    />
                )}
                    
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
            )}
            
          </View>
          
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

//     // useEffect(() => {
//     //     if (selectedVideo) {
//     //         fetch(selectedVideo.lrcFile)
//     //             .then(response => response.text())
//     //             .then(text => {
//     //                 lyricsRef.current = parseLRC(text);
//     //             });
//     //     }
//     // }, [selectedVideo]);

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

//     // const renderItem = ({ item }: { item: KaraokeVideos }) => (
//     //     <TouchableOpacity onPress={() => setSelectedVideo(item)}>
//     //         <Text style={styles.videoTitle}>{item.title}</Text>
//     //     </TouchableOpacity>
//     // );

//     const renderItem = ({ item }: { item: { id: string; title: string } }) => (
//         <TouchableOpacity onPress={() => setSelectedVideo(item)}>
//           <Text style={styles.videoTitle}>{item.title}</Text>
//         </TouchableOpacity>
//     );

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>{i18next.t('karaoke')}</Text>
//             {selectedVideo ? (
//                 <>
//                     <YouTube
//                         ref={youtubeRef}
//                         apiKey={youtubeApiKey}
//                         videoId={selectedVideo.id}
//                         play={true}
//                         fullscreen={false}
//                         loop={false}
//                         style={{ alignSelf: 'stretch', height: 200 }}
//                     />
//                     <Button 
//                         title={isRecording ? "Stop Singing" : "Start Singing"} 
//                         onPress={isRecording ? stopRecording : startRecording} 
//                     />
//                     <Text style={styles.score}>Score: {Math.round(score)}</Text>
//                 </>
//             ) : (
//                 <FlatList
//                     // data={karaokeVideos}
//                     data={dummyKaraokeVideos}
//                     renderItem={renderItem}
//                     keyExtractor={item => item.id}
//                 />
//             )}
//         </View>
//     );
// }

const styles = StyleSheet.create({
    container: {
        display: 'flex',
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
    score: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    }
});

export default GameKaraoke;