import { startStudySession } from '@/controllers/study-session';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn()
        },
        from: jest.fn().mockReturnThis(),
    },
}));

beforeEach(() => {
    jest.clearAllMocks()
})

describe('startStudySession', () => {
    it('should return session_id on successful insertion of new row with authenticated user ID', async () => {
        const mockStudySession = [{
            session_id: 'test-study-session-id',
            user_id: "test-user-id",
            start_time: "2025-01-01T00:00:00Z",
            end_time: null,
            is_active: true,
            is_public: true, 
            subject: "test-subject"
        }];

        const mockInsert = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockResolvedValue({
            data: mockStudySession,
            error: null,
        });
        
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
        });

        (supabase.from as jest.Mock).mockReturnValue({
            insert: mockInsert,
            select: mockSelect,
        });

        const result = await startStudySession(new Date('2025-01-01T00:00:00Z'), true, 'test-subject');

        expect(supabase.auth.getUser).toHaveBeenCalled();
        expect(supabase.from).toHaveBeenCalledWith('study_sessions');
        expect(result).toBe('test-study-session-id');
    });

    it('should return null if insert fails', async () => {
        const mockInsert = jest.fn().mockReturnThis()
        const mockSelect = jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'db error' },
        });
        
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'user1' } },
        });
        
        (supabase.from as jest.Mock).mockReturnValue({
            insert: mockInsert,
            select: mockSelect,
        })

        const result = await startStudySession(new Date('2025-01-01T00:00:00Z'), true, 'test-subject')

        expect(result).toBeNull()
    });
});
