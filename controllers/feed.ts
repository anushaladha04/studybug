import { supabase } from "@/lib/supabase";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export async function fetchPostsRandomOrder(seed: Float) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('No authenticated user found');
        return [];
    }

    const { data, error } = await supabase.rpc(
        'get_weighted_feed', {
            user_seed: seed.toString()
        }
    );
    
    if (error) {
        console.error('Error fetching posts:', error.message);
        return [];
    }

    return data;
}