import { supabase } from "@/lib/supabase";

export async function fetchPosts() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return [];
    }

    const { data, error } = await supabase
        .from('feed_view')
        .select('*')
        .eq('user_id', user.id)
    
    if (error) {
        console.error('Error fetching posts:', error.message);
        return [];
    }

    return data;
}