import { supabase } from "@/lib/supabase";

export async function startStudySession(sessionName: string, startTime: Date, isPublic: boolean, location: string, subject: string, focusLevel: string, note: string) {
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
                location_name: location,
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

export async function fetchSessionsByUser(userId: string) {
    const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching sessions:', error.message);
        return null;
    }

    return data;
}

// --- Helpers for timezone-aware date handling ---

function toLocalDateString(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date); // produces YYYY-MM-DD
}

function shiftDateString(dateStr: string, days: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(Date.UTC(year, month - 1, day + days));
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Returns an array of 7 duration values [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
// for a given week in the user's local timezone, based on session start_time.
// weekOffset: 0 = this week, 1 = last week, 2 = two weeks ago, etc.
export async function getWeeklyDurations(userId: string, weekOffset: number = 0): Promise<number[]> {
    const sessions = await fetchSessionsByUser(userId);
    if (!sessions) return [0, 0, 0, 0, 0, 0, 0];

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();

    const todayDateStr = toLocalDateString(now, timezone);
    // Parse the local date string as midnight UTC to get an unambiguous day-of-week
    // (avoids locale-dependent Intl weekday string matching).
    const todayDayOfWeek = new Date(todayDateStr + 'T00:00:00Z').getUTCDay(); // 0=Sun … 6=Sat
    const sundayDateStr = shiftDateString(todayDateStr, -todayDayOfWeek - weekOffset * 7);

    // [Sun, Mon, Tue, Wed, Thu, Fri, Sat] as YYYY-MM-DD strings in the user's timezone
    const weekDates = Array.from({ length: 7 }, (_, i) => shiftDateString(sundayDateStr, i));

    // Returns the UTC timestamp (ms) of local midnight for a YYYY-MM-DD date string.
    // Strategy: sample noon UTC for that calendar date, read back the local clock via Intl,
    // then subtract the elapsed local seconds to arrive at local midnight.
    function localMidnightUtcMs(dateStr: string): number {
        const [year, month, day] = dateStr.split('-').map(Number);
        const noonUtcMs = Date.UTC(year, month - 1, day, 12, 0, 0);
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).formatToParts(new Date(noonUtcMs));
        const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '12') % 24;
        const m = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0');
        const s = parseInt(parts.find(p => p.type === 'second')?.value ?? '0');
        return noonUtcMs - (h * 3600 + m * 60 + s) * 1000;
    }

    // UTC ms ranges [start, end) for each of the 7 local days
    const dayRanges = weekDates.map(dateStr => {
        const start = localMidnightUtcMs(dateStr);
        return { start, end: start + 24 * 60 * 60 * 1000 };
    });

    const durations = [0, 0, 0, 0, 0, 0, 0];

    for (const session of sessions) {
        if (!session.start_time || session.duration == null || session.duration === 0 || session.end_time == null) continue;

        const startMs = new Date(session.start_time).getTime();

        // Session still active / no end_time: assign all duration to the start day
        if (!session.end_time) {
            const sessionDateStr = toLocalDateString(new Date(session.start_time), timezone);
            const idx = weekDates.indexOf(sessionDateStr);
            if (idx !== -1) durations[idx] += session.duration;
            continue;
        }

        const endMs = new Date(session.end_time).getTime();
        const spanMs = endMs - startMs;
        if (spanMs <= 0) continue;

        // Distribute duration across days proportional to how much of [startMs, endMs)
        // overlaps each local day. Same-day sessions get 100% naturally.
        for (let i = 0; i < 7; i++) {
            const overlapMs = Math.max(0,
                Math.min(endMs, dayRanges[i].end) - Math.max(startMs, dayRanges[i].start)
            );
            if (overlapMs > 0) {
                durations[i] += session.duration * overlapMs / spanMs;
            }
        }
    }

    return durations;
}

export async function uploadSessionImage(sessionId: string, imageUri: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (! user) {
        console.log('No authenticated user found.');
        return null;
    }

    const response = await fetch(imageUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    
    const filePath = `${user.id}/${sessionId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('session_pictures')
      .upload(filePath, arrayBuffer, { 
        contentType: 'image/jpeg',
        upsert: true
     });

    if (uploadError) {
        console.error('Error uploading image to database: ', uploadError.message);
        return null;
    }

    const { data: urlData } = supabase.storage
      .from('session_pictures')
      .getPublicUrl(filePath);
    
    const publicUrl = urlData.publicUrl;

    const { error } = await supabase
        .from('study_sessions')
        .update({
            image_url: publicUrl,
        })
        .eq('session_id', sessionId);

    if (error) {
        console.error('Error uploading image: ', error.message);
        return null;
    }

    return publicUrl;
}
