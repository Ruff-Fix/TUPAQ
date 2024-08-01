import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from "@/components/Themed";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import { StyleSheet, FlatList, TouchableOpacity, Image, Button } from "react-native";
import YouTube from 'react-native-youtube';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { PitchDetector } from 'pitchy';
import { karaokeVideos } from '../components/karaokeVideos';
import { YOUTUBE_API_KEY } from '@/config';

type KaraokeVideos = {
    id: string;
    title: string;
    lrcFile: string;
};

type Lyric = { 
    time: number;
    lyric: string;
    note: string | null;
};

const audioRecorderPlayer = new AudioRecorderPlayer();
const pitchDetector = PitchDetector.forFloat32Array(2048);

const GameKaraoke = () => {
    const { language } = useLanguage();
    const [selectedVideo, setSelectedVideo] = useState<KaraokeVideos | null>(null);
    const [score, setScore] = useState<number>(0);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const youtubeRef = useRef<any>(null);
    const lyricsRef = useRef<Lyric[]>([]);
    const currentLyricIndex = useRef<number>(0);

    useEffect(() => {
        if (selectedVideo) {
            fetch(selectedVideo.lrcFile)
                .then(response => response.text())
                .then(text => {
                    lyricsRef.current = parseLRC(text);
                });
        }
    }, [selectedVideo]);

    const parseLRC = (lrcContent: string) => {
        const lines = lrcContent.split('\n');
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
        const noteRegex = /\[(\w#?\d)\]/;
        const result: Lyric[] = [];
    
        lines.forEach(line => {
            const timeMatch = line.match(timeRegex);
            if (timeMatch) {
                const [, minutes, seconds, milliseconds] = timeMatch;
                const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / (milliseconds.length === 2 ? 100 : 1000);
                
                const noteMatch = line.match(noteRegex);
                const note = noteMatch ? noteMatch[1] : null;
                
                const lyric = line.replace(timeRegex, '').replace(noteRegex, '').trim();
                
                result.push({ time, lyric, note });
            }
        });
    
        return result;
    };

    const startRecording = async () => {
        setIsRecording(true);
        await audioRecorderPlayer.startRecorder();
        audioRecorderPlayer.addRecordBackListener((e: any) => {
            const { currentPosition, currentMetering } = e;
            const [pitch] = pitchDetector.findPitch(new Float32Array([currentMetering]), 44100);
            
            const currentLyric = lyricsRef.current[currentLyricIndex.current];
            if (currentLyric && currentLyric.note && Math.abs(currentPosition / 1000 - currentLyric.time) < 0.5) {
                const expectedNote = noteToFrequency(currentLyric.note);
                const pitchAccuracy = 1 - Math.abs(pitch - expectedNote) / expectedNote;
                const timingAccuracy = 1 - Math.abs(currentPosition / 1000 - currentLyric.time) / 0.5;
                const lineScore = (pitchAccuracy + timingAccuracy) * 50;
                setScore(prevScore => prevScore + lineScore);
                currentLyricIndex.current++;
            }
        });
    };

    const stopRecording = async () => {
        setIsRecording(false);
        await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
    };

    const noteToFrequency = (note: string): number => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1);
        const semitone = notes.indexOf(noteName);
    
        if (semitone === -1) {
            throw new Error(`Invalid note: ${note}`);
        }
    
        // A4 is 440 Hz
        const A4 = 440;
        const A4_INDEX = notes.indexOf('A') + (4 * 12);
        const noteIndex = semitone + (octave * 12);
        const halfSteps = noteIndex - A4_INDEX;
    
        return A4 * Math.pow(2, halfSteps / 12);
    };

    const renderItem = ({ item }: { item: KaraokeVideos }) => (
        <TouchableOpacity onPress={() => setSelectedVideo(item)}>
            <Text style={styles.videoTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{i18next.t('karaoke')}</Text>
            {selectedVideo ? (
                <>
                    <YouTube
                        ref={youtubeRef}
                        apiKey={YOUTUBE_API_KEY}
                        videoId={selectedVideo.id}
                        play={true}
                        fullscreen={false}
                        loop={false}
                        style={{ alignSelf: 'stretch', height: 200 }}
                    />
                    <Button 
                        title={isRecording ? "Stop Singing" : "Start Singing"} 
                        onPress={isRecording ? stopRecording : startRecording} 
                    />
                    <Text style={styles.score}>Score: {Math.round(score)}</Text>
                </>
            ) : (
                <FlatList
                    data={karaokeVideos}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'Rowdies',
        fontSize: 30,
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