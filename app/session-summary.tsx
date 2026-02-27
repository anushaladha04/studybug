import Camera from '@/assets/icons/camera';
import PlusSign from '@/assets/icons/plus';
import { uploadSessionImage } from '@/controllers/study-session';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import AddToProfilePopup from '@/components/add-to-profile-popup';

export default function SessionSummary() {
    const router = useRouter();
    const { sessionId, sessionName, location, duration } = useLocalSearchParams();
    const [ isPopupVisible, setIsPopupVisible ] = useState(false);
    const [ image, setImage ] = useState('');
    const [ isUploadingImage, setIsUploadingImage ] = useState(false);

    const formattedDuration = (duration: number) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration - hours * 3600) / 60);

        if (hours == 0)
            return `${minutes} min`

        if (minutes == 0)
            return `${hours} hr`

        return `${hours} hr ${minutes} min`;
    }

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [6, 5],
            quality: 0.8
        })

        if (result.canceled)
            return;

        setImage(result.assets[0].uri);
    }

    const handleUploadImage = async () => {
        setIsUploadingImage(true);
        try {
            if (! image) {
                return;
            }
            const result = await uploadSessionImage(sessionId, image);
            if (result) {
                setIsPopupVisible(true);
            } else {
                Alert.alert("Error", "We couldn't save your image. Please try again.");
            }
        } catch (error) {
            console.error('Error uploading image: ', error);
        } finally {
            setIsUploadingImage(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.congrats}>Congrats! You finished your study session!</Text>
            
            <View style={styles.statsRow}>
                <View>
                <Text style={styles.sessionNameText}>{sessionName}</Text>
                <Text style={styles.locationText}>{location}</Text>
                </View>
                <View>
                <Text style={styles.timeLabel}>Total Time</Text>
                <Text style={styles.timeValue}>{formattedDuration(parseInt(duration))}</Text>
                </View>
            </View>

            <View style={styles.photoContainer}>
                <Text style={styles.addPhotoLabel}>Add Photo:</Text>
                
                <Pressable style={styles.placeholderBox} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.capturedImage} />
                    ) : (
                    <View style={styles.iconContainer}>
                        <Camera />
                        <View style={styles.plusCircle}>
                            <PlusSign />
                        </View>
                    </View>
                    )}
                </Pressable>
            </View>
            {image ? (<Pressable 
                    style={styles.continueButton}
                    onPress={handleUploadImage}
                    disabled={isUploadingImage}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                </Pressable>
                ) : (
                     <Pressable style={styles.skipButton} onPress={() => setIsPopupVisible(true)}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </Pressable>
                )
            }
            <AddToProfilePopup 
                isVisible={isPopupVisible}
                onSeeTrends={() => {
                    setIsPopupVisible(false);
                    router.push('/(tabs)/profile');
                }}
                onDone={() => {
                    setIsPopupVisible(false);
                    router.push('/(tabs)');
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 26, 
        backgroundColor: '#fff', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    congrats: { 
        fontSize: 18, 
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        marginBottom: 30,
        textAlign: 'left'
    },
    statsRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        width: '100%',
        marginBottom: 30 
    },
    sessionNameText: {
        fontSize: 16,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    locationText: {
        fontSize: 14,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    timeLabel: {
        fontSize: 14,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    timeValue: {
        fontSize: 16,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        textAlign: 'left'
    },
    photoContainer: {
        width: '100%',
        marginBottom: 40,
    },
    addPhotoLabel: {
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'Rethink Sans',
        marginBottom: 10,
        color: '#000',
    },
    placeholderBox: {
        width: '100%',
        aspectRatio: 6/5,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    plusCircle: {
        position: 'absolute',
        bottom: 15,
        right: 15,
        backgroundColor: '#1C9635',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    capturedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        width: '100%',
    },
    continueButton: {
        width: 184,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        backgroundColor: '#8DBF58'
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#FFF',
        textAlign: 'center'
    },
    skipButton: {
        width: 184,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#8DBF58'
    },
    skipButtonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#8DBF58',
        textAlign: 'center'
    }
});