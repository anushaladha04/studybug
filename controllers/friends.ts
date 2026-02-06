import { supabase } from "@/lib/supabase";
import { useAuthContext } from '@/hooks/use-auth-context';

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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return [];
    }

    const { data, error } = await supabase
        .from('friends')
        .select('from_ids')
        .eq('user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching friend requests:', error.message);
        return [];
    }

    return data?.from_ids || [];
}

export async function acceptFriendRequest(fromId: string) {

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
        .single();

    if (error) {
        console.error('Error fetching friends:', error.message);
        return [];
    }

    return data?.friends_ids || [];
}