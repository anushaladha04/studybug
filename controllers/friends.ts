import { supabase } from "@/lib/supabase";

export async function fetchByUsername(searchPattern: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchPattern}%`);
    
    if (error) {
        console.error('Error fetching users:', error.message);
        return null;
    }

    return data;
}

export async function requestFriend(friendId: string) {
    const { data, error } = await supabase
        .from('friends')
        .select('*');
    
    if (error) {
        console.error('Error requesting friend: ', error.message);
        return null;
    }

    return data;
}

export async function fetchFriendRequests() {

}

export async function acceptFriendRequest(fromId: string) {

}

export async function fetchFriends() {

}