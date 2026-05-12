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
    const { data, error } = await supabase.rpc('handle_post_comment', {
        curr_post_id: postId,
        curr_comment: commentText
    });

    if (error) {
        console.error('Error commenting on post: ', error.message);
        return [];
    }

    return data;
}

export async function fetchComments(postId: string) {
    const { data, error } = await supabase
        .from('post_comments')
        .select(`
            id,
            comment,
            commented_at,
            user_id,
            profiles (
                username,
                profile_image_path
            )
        `)
        .eq('post_id', postId)
        .order('commented_at', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error.message);
        return [];
    }
    return data;
}