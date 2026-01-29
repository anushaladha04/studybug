import { supabase } from "@/lib/supabase";

export async function startStudySession(userId: string, startTime: Date, isPublic: Boolean, subject: string) {
    const { data, error } = await supabase
        .from('study_sessions')
        .insert([
            { 
                user_id: userId, 
                start_time: startTime.toISOString(),
                end_time: null,
                is_public: isPublic, 
                subject: subject 
            },
        ])
        .select();

    if (error) {
        console.error('Error inserting data:', error.message);
        return null;
    } else {
        console.log('Successfully added todo:', data);
        return data;
    }
}