import { supabase } from "@/lib/supabase";

export async function startStudySession(sessionName: string, startTime: Date, isPublic: boolean, subject: string, focusLevel: string, note: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (! user) {
        console.log('No authenticated user found.');
        return null;
    }
    
    const { data, error } = await supabase
        .from('study_sessions')
        .insert([
            { 
                user_id: user?.id, 
                session_name: sessionName,
                start_time: startTime.toISOString(),
                end_time: null,
                is_active: true,
                is_public: isPublic, 
                subject: subject,
                focus_level: focusLevel,
                note: note
            },
        ])
        .select();

    if (error) {
        console.error('Error inserting data:', error.message);
        return null;
    } else {
        console.log('Successfully added todo:', data);
        return data[0].session_id;
    }
}

export async function endStudySession(sessionId: string, endTime: Date, duration: number) {    
    const { data, error } = await supabase
        .from('study_sessions')
        .update({
            end_time: endTime.toISOString(),
            duration: duration,
            is_active: false
        })
        .eq('session_id', sessionId)
        .select();

    if (error) {
        console.error('Error updating data:', error.message);
        return null;
    } else {
        console.log('Successfully updated end time:', data);
        return data;
    }
}
