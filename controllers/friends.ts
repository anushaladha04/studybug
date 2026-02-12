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
        .from('friends')
        .select('from_ids')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching friend requests:', error.message);
        return [];
    }

    return data?.from_ids || [];
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

export async function fetchFriends() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return [];
    }

    const { data, error } = await supabase
        .from('friends')
        .select('friends_ids')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        console.error('Error fetching friends:', error.message);
        return [];
    }

    return data?.friends_ids || [];
}

export async function fetchFriendsProfiles(ids: string[]) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids);

    if (error) {
        console.error("Error fetching friends profiles: ", error.message);
        return [];
    }

    return data;
}

export async function fetchActiveFriendIds() {
    const friendIds = await fetchFriends();

    const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .in('user_id', friendIds)
        .eq('is_active', true);

    if (error) {
        console.error("Error fetching active friends: ", error.message);
        return [];
    }

    return data.map(session => session.user_id);
}