import { supabase } from "@/lib/supabase";

export async function startStudySession(startTime: Date, isPublic: boolean, subject: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
        .from('study_sessions')
        .insert([
            { 
                user_id: user?.id, 
                start_time: startTime.toISOString(),
                end_time: null,
                is_active: true,
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