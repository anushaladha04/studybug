import { supabase } from "@/lib/supabase";

export async function fetchByUsername(searchPattern: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchPattern}%`)
        .limit(10);
    
    if (error) {
        console.error('Error fetching users:', error.message);
        return [];
    }

    return data;
}

export async function requestFriend(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (! user) {
       console.error('Not authenticated');
       return [];
    }

    if (! friendId) {
        console.error('Cannot find friend');
        return [];
    }

    const { data, error } = await supabase
        .rpc('send_friend_request', { 
            sender_id: user.id, 
            receiver_id: friendId
        });
            
    if (error) {
        console.error('Error requesting friend: ', error.message);
        return [];
    }

    return data;
}

export async function fetchFriendRequests() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return [];
    }

    const { data, error } = await supabase
        .from('friend_request_profiles_view')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching friend requests:', error.message);
        return [];
    }

    return data;
}

export async function acceptFriendRequest(fromId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (! user) {
       console.error('Not authenticated');
       return [];
    }
    
    const { data, error } = await supabase
        .rpc('accept_friend_request', { 
            original_sender_id: fromId, 
            curr_user_id: user?.id 
        });
            
    if (error) {
        console.error('Error accepting friend: ', error.message);
        return [];
    }

    return data;
}

export async function fetchAllFriends() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return [];
    }

    const { data, error } = await supabase
        .from('friend_profiles_view')
        .select('*')
        .eq('user_id', user.id)

    if (error) {
        console.error('Error fetching friends:', error.message);
        return [];
    }

    return data;
}