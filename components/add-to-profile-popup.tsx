import Caterpillar from '@/assets/images/popup-caterpillar';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface AddToProfilePopupProps {
    isVisible: boolean;
    onSeeTrends: () => void;
    onDone: () => void;
}

export default function AddToProfilePopup({ isVisible, onSeeTrends, onDone}: AddToProfilePopupProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            >
            <View style={styles.container}>
                <View style={styles.popupCard}>
                    <Text style={styles.title}>Your session has been added to your profile!</Text>
                    <Caterpillar />
                    <View style={styles.buttonContainer}>
                        <Pressable 
                            style={styles.seeTrendsButton}
                            onPress={onSeeTrends}
                        >
                            <Text style={styles.seeTrendsButtonText}>See Trends</Text>
                        </Pressable>
                        <Pressable 
                            style={styles.doneButton}
                            onPress={onDone}
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    popupCard: {
        backgroundColor: 'white',
        paddingVertical: 33,
        paddingHorizontal: 21,
        gap: 15,
        borderRadius: 15,
        width: 311,
        height: 325,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
    },
    title: { 
        fontSize: 18, 
        fontWeight: 500, 
        fontFamily: 'Rethink Sans',
        textAlign: 'center',
        marginBottom: 10 
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15,
        width: '100%',
    },
    seeTrendsButton: {
        width: 184,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        backgroundColor: '#8DBF58'
    },
    seeTrendsButtonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#FFF',
        textAlign: 'center'
    },
    doneButton: {
        width: 184,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#8DBF58'
    },
    doneButtonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#8DBF58',
        textAlign: 'center'
    }
});