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
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .rpc('send_friend_request', { 
            sender_id: user?.id, 
            receiver_id: friendId
        });
            
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