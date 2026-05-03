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

export async function commentOnPost(postId: string, commentText: string) {
    const { error } = await supabase.rpc('handle_post_comment', {
        curr_post_id: postId,
        curr_comment: commentText
    });

    if (error) {
        console.error('Error commenting on post: ', error.message);
        return;
    }

    return;
}

export async function fetchComments() {
    
}