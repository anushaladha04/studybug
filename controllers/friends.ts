import { supabase } from "@/lib/supabase";

export async function fetchByUsername(searchPattern: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', searchPattern);
    
    if (error) {
        console.error('Error fetching users:', error.message);
        return null;
    }

    return data;
}

export async function requestFriend(friendId: string) {

}

export async function fetchFriendRequests() {

}

export async function acceptFriendRequest(fromId: string) {

}

export async function fetchFriends() {

}