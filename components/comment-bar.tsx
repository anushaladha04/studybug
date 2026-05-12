import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface CommentBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    disabled?: boolean;
    isLoading?: boolean;
    autoFocus?: boolean;
}

export default function CommentBar({ value, onChangeText, onSend, disabled, isLoading, autoFocus }: CommentBarProps) {
    return (
        <View style={styles.commentBar}>
            <TextInput
                style={styles.input}
                placeholder={"Comment"}
                placeholderTextColor="#717171"
                value={value}
                onChangeText={onChangeText}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={autoFocus}
                editable={!isLoading}
            />
            <Pressable 
                onPress={onSend} 
                hitSlop={10} 
                disabled={disabled || isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                ) : (
                    <Text style={[
                        styles.sendText, 
                        (disabled || value.trim() === '') && { color: '#A1A1A1' } // Dim if empty or disabled
                    ]}>
                        Send
                    </Text>
                )}
            </Pressable>
        </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 13,
        alignItems: 'center',
    },
    commentBar: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        height: 42,
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        flex: 1,
        color: '#000000',
        fontSize: 16,
        fontFamily: 'Rethink Sans',
        fontStyle: 'normal'
    },
    sendText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000000',     // Matches the "Send" in your image
        fontFamily: 'Rethink Sans',
        fontStyle: 'normal'
    },
});