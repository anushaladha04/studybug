import Cancel from '@/assets/icons/cancel.svg';
import SearchIcon from '@/assets/icons/search.svg';

import { Pressable, StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
    placeholder: string;
}

export default function SearchBar({ value, onChangeText, onClear, placeholder }: SearchBarProps) {
    return (
        <View style={styles.searchBar}>
            <SearchIcon width={16} height={16} fill='transparent' styles={styles.searchIcon}/>
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor="#717171"
                value={value}
                onChangeText={onChangeText}
            />
            {value.length > 0 && (
            <Pressable onPress={onClear} style={styles.clearButton}>
                <Cancel width={15} height={15} fill="#737373"/>
            </Pressable>
            )}
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        height: 32,
        backgroundColor: '#f0f0f0',
        borderRadius: 18,
        paddingHorizontal: 7,
        paddingVertical: 5,
        gap: 10,
        shadowColor: '#000000',
        shadowOffset: {
        width: 0,
        height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4, 
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#717171',
        fontSize: 14,
    },
    clearButton: {
        padding: 6,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
});