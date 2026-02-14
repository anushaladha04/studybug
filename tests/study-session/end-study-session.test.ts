import { endStudySession } from '@/controllers/study-session';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
    },
}));

beforeEach(() => {
    jest.clearAllMocks();
});

describe('endStudySession', () => {
    it('should update session and return data on success', async () => {
        const mockUpdatedRow = [
            {
                session_id: 'test-session-id',
                end_time: '2025-01-01T01:00:00Z',
                is_active: false,
            },
        ];

        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockResolvedValue({
            data: mockUpdatedRow,
            error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            update: mockUpdate,
            eq: mockEq,
            select: mockSelect,
        });

        const result = await endStudySession('test-session-id', new Date('2025-01-01T01:00:00Z'));

        expect(supabase.from).toHaveBeenCalledWith('study_sessions');
        expect(result).toEqual(mockUpdatedRow);
    });

    it('should return null if update fails', async () => {
        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'db error' },
        });

        (supabase.from as jest.Mock).mockReturnValue({
            update: mockUpdate,
            eq: mockEq,
            select: mockSelect,
        });

        const result = await endStudySession('test-session-id', new Date('2025-01-01T00:00:00Z'));

        expect(result).toBeNull();
    });

    it('should send correct update payload to supabase', async () => {
        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockResolvedValue({
            data: [],
            error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            update: mockUpdate,
            eq: mockEq,
            select: mockSelect,
        });

        const endTime = new Date('2025-01-01T02:00:00Z');

        await endStudySession('test-session-id', endTime);

        expect(mockUpdate).toHaveBeenCalledWith({end_time: endTime.toISOString(), is_active: false,});
    });

    it('should filter by correct session_id', async () => {
        const mockUpdate = jest.fn().mockReturnThis();
        const mockEq = jest.fn().mockReturnThis();
        const mockSelect = jest.fn().mockResolvedValue({
            data: [],
            error: null,
        });

        (supabase.from as jest.Mock).mockReturnValue({
            update: mockUpdate,
            eq: mockEq,
            select: mockSelect,
        });

        await endStudySession('test-session-id', new Date('2025-01-01T00:00:00Z'));

        expect(mockEq).toHaveBeenCalledWith('session_id', 'test-session-id');
    });
});
