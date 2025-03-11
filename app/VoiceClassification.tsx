import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal } from 'react-native';
import { Audio } from 'expo-av';
import * as Pitchy from 'pitchy';
import { LinearGradient } from 'expo-linear-gradient';

// Add props to accept callbacks from parent
interface VoiceClassificationProps {
    isVisible: boolean;
    onClose: () => void;
    onVoiceTypeDetected: (voiceType: string, range: {min: number, max: number}) => void;
  }

const VoiceClassification: React.FC<VoiceClassificationProps> = ({
    isVisible,
    onClose,
    onVoiceTypeDetected
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [voiceType, setVoiceType] = useState('');
    const [pitchRange, setPitchRange] = useState({ min: 0, max: 0 });
    const [confidence, setConfidence] = useState(0);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const barHeightAnim = useRef(new Animated.Value(0)).current;
    const pitchDetectorRef = useRef<any>(null);

    // Handle completion
    const handleCompletion = () => {
        if (voiceType) {
            onVoiceTypeDetected(voiceType, pitchRange);
        }
        onClose();
    };
    
    // Voice ranges in Hz
    const voiceRanges = {
        bass: { min: 70, max: 300 },
        baritone: { min: 100, max: 350 },
        tenor: { min: 130, max: 500 },
        alto: { min: 180, max: 700 },
        mezzoSoprano: { min: 200, max: 900 },
        soprano: { min: 250, max: 1100 }
    };
    
    const startVoiceTest = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            
            const recording = new Audio.Recording();

            // await recording.prepareToRecordAsync({
            //     isMeteringEnabled: true,
            //     android: {
            //         extension: '.wav',
            //         outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
            //         audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
            //         sampleRate: 44100,
            //         numberOfChannels: 1,
            //         bitRate: 128000,
            //     },
            //     ios: {
            //         extension: '.wav',
            //         audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            //         sampleRate: 44100,
            //         numberOfChannels: 1,
            //         bitRate: 128000,
            //         linearPCMBitDepth: 16,
            //         linearPCMIsBigEndian: false,
            //         linearPCMIsFloat: false,
            //     },
            //     web: {
            //         mimeType: 'audio/webm',
            //         bitsPerSecond: 128000,
            //     }
            // });

            // Use the preset which includes all platform configurations
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            
            await recording.startAsync();
            recordingRef.current = recording;
            setIsRecording(true);
            
            // Reset pitch range
            setPitchRange({ min: Number.MAX_VALUE, max: 0 });
            
            // Start processing audio for pitch detection
            processAudio();
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    // In your component initialization or useEffect
    useEffect(() => {
        // Create a pitch detector for Float32Array with buffer size 2048
        pitchDetectorRef.current = Pitchy.PitchDetector.forFloat32Array(2048);
    }, []);

    const processAudio = async () => {
        const interval = setInterval(async () => {
            if (!recordingRef.current || !isRecording) {
                clearInterval(interval);
                return;
            }
            
            try {
                // Get the status of the recording
                const status = await recordingRef.current.getStatusAsync();
                
                // Create an AudioBuffer from the recording
                // Note: This is a simplified example - in practice, you'd need to
                // implement a way to get raw audio data from the recording
                const audioData = await getAudioDataFromRecording(recordingRef.current);
                
                if (audioData) {
                    // Use Pitchy for pitch detection
                    const [pitch, clarity] = pitchDetectorRef.current.findPitch(
                        audioData, 
                        Audio.RecordingOptionsPresets.HIGH_QUALITY.android.sampleRate || 44100
                    );

                    // Only use pitches with decent clarity
                    if (clarity > 0.7 && pitch > 50) {  // Filter out noise
                        // Update pitch range
                        setPitchRange(prev => ({
                            min: Math.min(prev.min, pitch),
                            max: Math.max(prev.max, pitch)
                        }));
                        
                        // Animate the barometer
                        Animated.timing(barHeightAnim, {
                            toValue: (pitch - 70) / 1000 * 100, // Scale pitch to percentage
                            duration: 100,
                            useNativeDriver: false
                        }).start();
                        
                        setConfidence(clarity);
                    }
                }
            } catch (error) {
                console.error('Error processing audio:', error);
            }
        }, 100);
    };

    // This function would need to be implemented to get audio data
    const getAudioDataFromRecording = async (recording: Audio.Recording): Promise<Float32Array> => {
    // In a real implementation, you'd extract raw audio data
    // This is just a placeholder - getting raw PCM data from Expo Audio
    // is not straightforward and might require native modules
    
    // Return a mock Float32Array for now
    return new Float32Array(1024).fill(0);
};
    
    const stopVoiceTest = async () => {
        if (recordingRef.current) {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            setIsRecording(false);
            
            // Analyze voice type based on pitch range
            analyzeVoiceType();
        }
    };
    
    const analyzeVoiceType = () => {
        const { min, max } = pitchRange;
        
        // Simple classification based on range
        if (max < voiceRanges.baritone.max) {
            setVoiceType('Bass');
        } else if (max < voiceRanges.tenor.max) {
            setVoiceType('Baritone');
        } else if (max < voiceRanges.alto.max) {
            setVoiceType('Tenor');
        } else if (max < voiceRanges.mezzoSoprano.max) {
            setVoiceType('Alto');
        } else if (max < voiceRanges.soprano.max) {
            setVoiceType('Mezzo-Soprano');
        } else {
            setVoiceType('Soprano');
        }
    };
    
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Discover Your Voice Type</Text>
                
                <View style={styles.barContainer}>
                    <LinearGradient
                        colors={['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6']}
                        style={styles.barBackground}
                    >
                        <View style={styles.barLabels}>
                            <Text style={styles.barLabel}>Soprano</Text>
                            <Text style={styles.barLabel}>Mezzo</Text>
                            <Text style={styles.barLabel}>Alto</Text>
                            <Text style={styles.barLabel}>Tenor</Text>
                            <Text style={styles.barLabel}>Baritone</Text>
                            <Text style={styles.barLabel}>Bass</Text>
                        </View>
                        
                        <Animated.View 
                            style={[
                                styles.barIndicator, 
                                { height: barHeightAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%']
                                })}
                            ]}
                        />
                    </LinearGradient>
                </View>
                
                {voiceType ? (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>Your Voice Type:</Text>
                        <Text style={styles.resultVoice}>{voiceType}</Text>
                        <Text style={styles.resultDetails}>
                            Range: {Math.round(pitchRange.min)}Hz - {Math.round(pitchRange.max)}Hz
                        </Text>
                        <TouchableOpacity
                            style={[styles.button, styles.continueButton]}
                            onPress={handleCompletion}
                        >
                            <Text style={styles.buttonText}>Continue to Karaoke</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={styles.instructions}>
                        Sing a few notes from your lowest to your highest comfortable range
                    </Text>
                )}
                
                <TouchableOpacity
                    style={[
                        styles.button,
                        isRecording ? styles.stopButton : styles.startButton
                    ]}
                    onPress={isRecording ? stopVoiceTest : startVoiceTest}
                >
                    <Text style={styles.buttonText}>
                        {isRecording ? "I'm Done" : "Start Voice Test"}
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        fontFamily: 'Rowdies',
    },
    barContainer: {
        width: '80%',
        height: 300,
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    barBackground: {
        width: 60,
        height: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    barIndicator: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.7)',
        position: 'absolute',
        bottom: 0,
    },
    barLabels: {
        position: 'absolute',
        right: 70,
        height: '100%',
        justifyContent: 'space-between',
    },
    barLabel: {
        color: '#fff',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    instructions: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 16,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
    },
    startButton: {
        backgroundColor: '#9000ff',
    },
    stopButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    resultTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    resultVoice: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#9000ff',
    },
    resultDetails: {
        marginTop: 10,
        fontSize: 14,
        opacity: 0.7,
    },
    continueButton: {
        backgroundColor: '#4CAF50',
        marginTop: 20,
    },
});

export default VoiceClassification;