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
            user_id: 'test-user-id',
            session_name: 'test session',
            start_time: '2025-01-01T00:00:00Z',
            end_time: null,
            is_active: true,
            is_public: true, 
            subject: 'test-subject',
            focus_level: 'high',
            note: 'test note'
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

        const result = await startStudySession('test session', new Date('2025-01-01T00:00:00Z'), true, 'test-subject', 'high', 'test note');

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
            data: { user: { id: 'test-user-id' } },
        });
        
        (supabase.from as jest.Mock).mockReturnValue({
            insert: mockInsert,
            select: mockSelect,
        })

        const result = await startStudySession('test session', new Date('2025-01-01T00:00:00Z'), true, 'test-subject', 'high', 'test note');

        expect(result).toBeNull();
    });

    it('should handle missing user gracefully', async () => {
        const mockInsert = jest.fn().mockReturnThis()
        const mockSelect = jest.fn().mockResolvedValue({
            data: [{ session_id: 'test-study-session-id' }],
            error: null,
        });

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: null },
        });

        (supabase.from as jest.Mock).mockReturnValue({
            insert: mockInsert,
            select: mockSelect,
        });

        const result = await startStudySession('test session', new Date('2025-01-01T00:00:00Z'), true, 'test-subject', 'high', 'test note');
        expect(result).toBeNull();
    });

    test('sends correct data to supabase', async () => {
        const mockInsert = jest.fn().mockReturnThis()
        const mockSelect = jest.fn().mockResolvedValue({
            data: [{ session_id: 'test-study-session-id' }],
            error: null,
        });

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
        });
        
        (supabase.from as jest.Mock).mockReturnValue({
            insert: mockInsert,
            select: mockSelect,
        });

        const startTime = new Date('2025-01-01T00:00:00Z');

        await startStudySession('test session', startTime, true, 'test-subject', 'high', 'test note')

        expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining([{
                user_id: 'test-user-id',
                session_name: 'test session',
                start_time: '2025-01-01T00:00:00.000Z',
                end_time: null,
                is_active: true,
                is_public: true, 
                subject: 'test-subject',
                focus_level: 'high',
                note: 'test note'
            }])
        );
    });
});
