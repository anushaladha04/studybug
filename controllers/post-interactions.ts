import { supabase } from "@/lib/supabase";

export async function likePost(postId: string) : Promise<void> {
    const { error } = await supabase.rpc('handle_post_like', {
        curr_post_id: postId
    });

    if (error) {
        console.error('Error liking post: ', error.message);
        return;
    }

    return;
}

export async function commentOnPost() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user ) 
        return [];

    return;
}