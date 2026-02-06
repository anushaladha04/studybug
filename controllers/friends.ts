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
    const { session } = useAuthContext();
    const id = session?.user?.id?;
    
}

export async function acceptFriendRequest(fromId: string) {

}

export async function fetchFriends() {

}