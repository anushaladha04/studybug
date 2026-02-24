import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface EndSessionPopupProps {
    isVisible: boolean;
    onGoBack: () => void;
    onConfirm: () => void;
}

export default function EndSessionPopup({ isVisible, onGoBack, onConfirm}: EndSessionPopupProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onGoBack}
            >
            <View style={styles.container}>
                <View style={styles.popupCard}>
                    <Text style={styles.title}>Are you sure you want to end your session?</Text>
                <View style={styles.buttonContainer}>
                    <Pressable 
                        style={styles.confirmButton}
                        onPress={() => {
                            onConfirm();
                            onGoBack();
                        }}
                    >
                        <Text style={styles.confirmButtonText}>Yes</Text>
                    </Pressable>
                    <Pressable 
                        style={styles.goBackButton}
                        onPress={() => onGoBack()}
                    >
                        <Text style={styles.goBackButtonText}>Go back</Text>
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
        height: 267,
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
        gap: 15,              // Spacing between buttons
        width: '100%',
    },
    confirmButton: {
        width: 184,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        backgroundColor: '#8DBF58'
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#FFF',
        textAlign: 'center'
    },
    goBackButton: {
        width: 184,
        height: 43,
        paddingVertical: 11.18,
        paddingHorizontal: 27.33,
        borderRadius: 38,
        color: '#FFF',
        borderWidth: 1,
        borderColor: '#8DBF58'
    },
    goBackButtonText: {
        fontSize: 18,
        fontWeight: 500,
        fontFamily: 'Rethink Sans',
        color: '#8DBF58',
        textAlign: 'center'
    }
});