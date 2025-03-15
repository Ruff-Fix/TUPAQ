import React, { useEffect, useState, useRef } from 'react';
import { View, Text } from "@/components/Themed";
import { useLanguage } from "./LanguageContext";
import i18next from "@/app/i18n";
import { 
  Button, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Image,
  Animated,
  Dimensions,
  StatusBar
} from "react-native";
import * as Pitchy from 'pitchy';
import { Audio } from 'expo-av';
import { useEvent } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import { EssentiaWASM } from 'essentia.js';
import { KaraokeVideo, karaokeVideos } from '../components/karaokeVideos';
import VoiceClassification from './VoiceClassificationOld';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const GameKaraoke: React.FC = () => {
    // State management
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const { language } = useLanguage();
    const [selectedVideo, setSelectedVideo] = useState<KaraokeVideo | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showVoiceModal, setShowVoiceModal] = useState<boolean>(true);
    const [userVoiceType, setUserVoiceType] = useState<string>('');
    const [userVoiceRange, setUserVoiceRange] = useState<{min: number, max: number}>({min: 0, max: 0});
    const [filteredVideos, setFilteredVideos] = useState<KaraokeVideo[]>(karaokeVideos);
    
    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    
    // API Keys
    const privVimeoApiKey = '7d6b191090278962eb0cf853ff6c6f43';
    
    // Player setup
    // const player = useVideoPlayer(null, player => {
    //     player.loop = false;
    // });
    const player = useVideoPlayer(videoUrl ? { uri: videoUrl } : null, player => {
        player.loop = false;
    });

    // useEffect(() => {
    //     if (videoUrl && player) {
    //         // Try to update the player's source if possible
    //         try {
    //             // Different approaches to try:
                
    //             // Option 1: If player has a replaceCurrentItem method
    //             if (typeof player.replaceCurrentItem === 'function') {
    //                 player.replaceCurrentItem({ uri: videoUrl });
    //             } 
    //             // Option 2: If player has a reset and play method
    //             else if (typeof player.reset === 'function' && typeof player.play === 'function') {
    //                 player.reset();
    //                 // Some delay might be needed before playing
    //                 setTimeout(() => {
    //                     player.play();
    //                 }, 100);
    //             }
    //         } catch (error) {
    //             console.error('Error updating video source:', error);
    //         }
    //     }
    // }, [videoUrl, player]);
    
    // Get current playing state from the player
    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    // Voice classification handler
    const handleVoiceDetection = (voiceType: string, range: {min: number, max: number}) => {
        setUserVoiceType(voiceType);
        setUserVoiceRange(range);
        
        // Filter videos based on voice type
        filterVideosByVoiceType(voiceType);
        
        // Animate in the content
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true
            })
        ]).start();
    };
    
    // Filter videos based on voice type
    const filterVideosByVoiceType = (voiceType: string) => {
        // In a real app, you'd have voice type tags for each video
        // For now, we'll just simulate this with a simple filter
        let filtered = [...karaokeVideos];
        
        // Example sorting logic - in production, you'd match songs to voice type
        if (voiceType === 'Bass' || voiceType === 'Baritone') {
            // Move lower-register songs to the top
            filtered.sort((a, b) => {
                if (a.id === '2') return -1; // Under the bridge is good for lower voices
                if (b.id === '2') return 1;
                return 0;
            });
        } else if (voiceType === 'Tenor' || voiceType === 'Alto') {
            // No specific sorting for mid-range voices
            // In a real app, you'd have appropriate songs tagged
        } else {
            // Higher voice types
            filtered.sort((a, b) => {
                if (a.id === '1') return -1; // Adele for higher voices
                if (b.id === '1') return 1;
                return 0;
            });
        }
        
        setFilteredVideos(filtered);
    };
    
    // Retest voice button handler
    const retestVoice = () => {
        setShowVoiceModal(true);
    };

    // Video selection effect
    useEffect(() => {
        if (selectedVideo) {
            fetchVideoUrl(selectedVideo.url);
        }
    }, [selectedVideo]);

    // Recording state effect
    useEffect(() => {
        if (isRecording && player) {
            player.play();
        } else if (!isRecording && player) {
            player.pause();
        }
    }, [isRecording, player]);

    // Fetch video URL
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
            const playerEmbedUrl = data.player_embed_url;
            
            if (!playerEmbedUrl) {
                throw new Error('No player embed URL found');
            }
            
            const configUrl = `${playerEmbedUrl.split('?')[0]}/config`;
            
            const configResponse = await fetch(configUrl, {
                headers: {
                    'Authorization': `Bearer ${privVimeoApiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.vimeo.*+json;version=3.4'
                },
            });
            
            if (!configResponse.ok) {
                throw new Error(`HTTP error getting config! status: ${configResponse.status}`);
            }
            
            const configData = await configResponse.json();
            const progressive = configData.request?.files?.progressive;
            
            if (progressive && Array.isArray(progressive) && progressive.length > 0) {
                const sortedStreams = progressive.sort((a, b) => b.height - a.height);
                const videoStreamUrl = sortedStreams[0].url;
                
                setVideoUrl(videoStreamUrl);
                // player.setSource({ uri: videoStreamUrl });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Video Error',
                    text2: 'Could not load the video stream',
                });
                setVideoUrl(null);
            }
        } catch (error) {
            console.error('Error fetching video URL:', error);
            Toast.show({
                type: 'error',
                text1: 'Connection Error',
                text2: 'Failed to load the video',
            });
            setVideoUrl(null);
        } finally {
            setLoading(false);
        }
    };
    
    // Start recording
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
            
            Toast.show({
                type: 'info',
                text1: 'Recording Started',
                text2: 'Sing along with the music!',
                position: 'bottom',
            });
        } catch (error) {
            console.error('Failed to start recording', error);
            Toast.show({
                type: 'error',
                text1: 'Recording Failed',
                text2: 'Please check your microphone permissions',
            });
        }
    };

    // Stop recording
    const stopRecording = async (): Promise<void> => {
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                setIsRecording(false);
                
                // Simulate a score based on voice type matching
                // In a real app, you'd do actual pitch comparison
                const newScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-99
                setScore(newScore);
                
                Toast.show({
                    type: 'success',
                    text1: 'Performance Complete!',
                    text2: `You scored ${newScore} points!`,
                    position: 'bottom',
                });
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
        }
    };

    // Render list item
    const renderItem = ({ item }: { item: KaraokeVideo }) => (
        <TouchableOpacity 
            onPress={() => setSelectedVideo(item)}
            style={[styles.videoItem, selectedVideo?.id === item.id && styles.selectedVideoItem]}
            activeOpacity={0.7}
        >
            <LinearGradient
                colors={selectedVideo?.id === item.id ? 
                    ['#9000ff', '#5800a3'] : 
                    ['#2a2a2a', '#1a1a1a']}
                style={styles.videoItemGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
            >
                <View style={styles.videoItemLeft}>
                    {item.thumbnailUrl ? (
                        <Image 
                            source={{ uri: item.thumbnailUrl }} 
                            style={styles.videoItemImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.videoItemImagePlaceholder}>
                            <Ionicons name="musical-notes" size={24} color="#fff" />
                        </View>
                    )}
                </View>
                <View style={styles.videoItemRight}>
                    <Text style={[
                        styles.videoTitle, 
                        selectedVideo?.id === item.id && styles.selectedVideoTitle
                    ]}>
                        {item.title}
                    </Text>
                    {voiceRangeMatch(item) && (
                        <View style={styles.voiceMatchBadge}>
                            <Text style={styles.voiceMatchText}>Perfect for {userVoiceType}</Text>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
    
    // Helper to determine if a song matches the user's voice range
    const voiceRangeMatch = (video: KaraokeVideo): boolean => {
        // In a real app, you'd have proper song metadata with vocal ranges
        // For this demo, we're just simulating based on the video IDs
        if (!userVoiceType) return false;
        
        if ((userVoiceType === 'Bass' || userVoiceType === 'Baritone') && video.id === '2') {
            return true;
        }
        
        if ((userVoiceType === 'Mezzo-Soprano' || userVoiceType === 'Soprano') && video.id === '1') {
            return true;
        }
        
        return false;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Voice Classification Modal */}
            <VoiceClassification 
                isVisible={showVoiceModal}
                onClose={() => setShowVoiceModal(false)}
                onVoiceTypeDetected={handleVoiceDetection}
            />
            
            {/* Header */}
            <LinearGradient
                colors={['#9000ff', '#6a00bf']}
                style={styles.header}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
            >
                <Text style={styles.title}>{i18next.t('karaoke')}</Text>
                
                {/* Voice type display */}
                {userVoiceType && (
                    <View style={styles.voiceInfoContainer}>
                        <Text style={styles.voiceInfoText}>
                            Voice: <Text style={styles.voiceType}>{userVoiceType}</Text>
                        </Text>
                        <TouchableOpacity 
                            style={styles.retestButton}
                            onPress={retestVoice}
                        >
                            <Text style={styles.retestButtonText}>Retest</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </LinearGradient>
            
            {/* Main content */}
            <Animated.View 
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                {/* Video player section */}
                <View style={styles.videoContainer}>
                    {selectedVideo && loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#9000ff" />
                            <Text style={styles.loadingText}>Loading video...</Text>
                        </View>
                    ) : videoUrl ? (
                        <View style={styles.playerContainer}>
                            <VideoView
                                player={player}
                                style={styles.videoPlayer}
                                contentFit="contain"
                                nativeControls={true}
                            />
                            
                            {isRecording && (
                                <View style={styles.recordingIndicator}>
                                    <Animated.View 
                                        style={[
                                            styles.recordingDot,
                                            {
                                                opacity: new Animated.Value(1).interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.4, 1]
                                                })
                                            }
                                        ]}
                                    />
                                    <Text style={styles.recordingText}>Recording...</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.selectVideoPrompt}>
                            <Ionicons name="videocam" size={50} color="#9000ff" />
                            <Text style={styles.selectVideoText}>Select a video to play</Text>
                        </View>
                    )}
                </View>
                
                {/* Score display */}
                {score > 0 && (
                    <View style={styles.scoreContainer}>
                        <LinearGradient
                            colors={['#4CAF50', '#2E7D32']}
                            style={styles.scoreBackground}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                        >
                            <Text style={styles.scoreTitle}>Your Score</Text>
                            <Text style={styles.scoreValue}>{score}</Text>
                            <View style={styles.scoreBar}>
                                <View style={[styles.scoreProgress, { width: `${score}%` }]} />
                            </View>
                        </LinearGradient>
                    </View>
                )}
                
                {/* Video selection list */}
                <View style={styles.videosListContainer}>
                    <Text style={styles.sectionTitle}>
                        {userVoiceType ? `Songs for ${userVoiceType} Voice` : 'Available Songs'}
                    </Text>
                    
                    <FlatList
                        data={filteredVideos}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        style={styles.videosList}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        showsVerticalScrollIndicator={false}
                    />
                    
                    {/* Recording controls */}
                    <TouchableOpacity 
                        style={[
                            styles.recordButton,
                            isRecording ? styles.stopButton : styles.startButton,
                            !videoUrl && styles.disabledButton
                        ]}
                        onPress={isRecording ? stopRecording : startRecording}
                        disabled={!videoUrl}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={isRecording ? 
                                ['#e74c3c', '#c0392b'] : 
                                ['#9000ff', '#6a00bf']}
                            style={styles.recordButtonGradient}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                        >
                            <Ionicons 
                                name={isRecording ? "stop" : "mic"} 
                                size={24} 
                                color="white" 
                            />
                            <Text style={styles.recordButtonText}>
                                {isRecording ? "Stop Singing" : "Start Singing"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>
            
            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        width: '100%',
        paddingTop: 10,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    title: {
        fontFamily: 'Rowdies',
        fontSize: 28,
        color: 'white',
        textAlign: 'center',
        marginBottom: 5,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    videoContainer: {
        width: '100%',
        height: height * 0.3,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 14,
    },
    playerContainer: {
        flex: 1,
        position: 'relative',
    },
    videoPlayer: {
        flex: 1,
    },
    recordingIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    recordingDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        marginRight: 5,
    },
    recordingText: {
        color: 'white',
        fontSize: 12,
    },
    selectVideoPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectVideoText: {
        color: '#9000ff',
        marginTop: 10,
        fontSize: 16,
    },
    scoreContainer: {
        width: '100%',
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    scoreBackground: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    scoreTitle: {
        color: 'white',
        fontSize: 14,
        marginBottom: 5,
    },
    scoreValue: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    scoreBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    scoreProgress: {
        height: '100%',
        backgroundColor: 'white',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        marginLeft: 5,
    },
    videosListContainer: {
        flex: 1,
        width: '100%',
    },
    videosList: {
        flex: 1,
        marginBottom: 10,
    },
    separator: {
        height: 10,
        backgroundColor: 'transparent',
    },
    videoItem: {
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 5,
    },
    videoItemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingRight: 10,
    },
    selectedVideoItem: {
        elevation: 5,
        shadowColor: '#9000ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },
    videoItemLeft: {
        marginLeft: 10,
        marginRight: 15,
        width: 60,
        height: 60,
        borderRadius: 5,
        overflow: 'hidden',
    },
    videoItemImage: {
        width: '100%',
        height: '100%',
    },
    videoItemImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoItemRight: {
        flex: 1,
    },
    videoTitle: {
        fontSize: 16,
        color: 'white',
    },
    selectedVideoTitle: {
        fontWeight: 'bold',
    },
    voiceMatchBadge: {
        backgroundColor: 'rgba(76,175,80,0.8)',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    voiceMatchText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    recordButton: {
        borderRadius: 30,
        overflow: 'hidden',
        marginVertical: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    recordButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
    },
    startButton: {
        backgroundColor: '#9000ff',
    },
    stopButton: {
        backgroundColor: '#e74c3c',
    },
    disabledButton: {
        opacity: 0.5,
    },
    recordButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    voiceInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    voiceInfoText: {
        color: 'white',
        fontSize: 14,
    },
    voiceType: {
        fontWeight: 'bold',
        color: 'white',
    },
    retestButton: {
        marginLeft: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 15,
    },
    retestButtonText: {
        color: 'white',
        fontSize: 12,
    },
});

export default GameKaraoke;