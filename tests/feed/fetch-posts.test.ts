import { fetchPosts } from '@/controllers/feed';
import { supabase } from '@/lib/supabase';
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis()
    }
}));

beforeEach(() => {
    jest.clearAllMocks()
});

describe('fetchByUsername', () => {
    it('should return all friends\' study sessions which are completed and public', async () => {
        const mockPosts = [
            {
                user_id: 'test-user-id',
                friend_id: 'friend-id-1',
                full_name: 'Friend Name 1',
                session_id: 'test-session-id-1',
                location_name: 'Test Location 1',
                duration: 1000,
                end_time: '2026-02-14 00:00:00+00'
            },
            {
                user_id: 'test-user-id',
                friend_id: 'friend-id-1',
                full_name: 'Friend Name 1',
                session_id: 'test-session-id-2',
                location_name: 'Test Location 2',
                duration: 6000,
                end_time: '2026-02-14 00:00:00+00'
            },
            {
                user_id: 'test-user-id',
                friend_id: 'friend-id-2',
                full_name: 'Friend Name 2',
                session_id: 'test-session-id-3',
                location_name: 'Test Location 3',
                duration: 2000,
                end_time: '2026-02-14 00:00:00+00'
            }
        ];

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
        });

        (supabase.eq as jest.Mock).mockResolvedValue({
            data: mockPosts,
            error: null,
        });
        
        const result = await fetchPosts();

        expect(supabase.from).toHaveBeenCalledWith('feed_view');

        expect(supabase.select).toHaveBeenCalledWith('*');
        expect(supabase.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
        
        expect(result).toEqual(mockPosts);
    });

    it('should return no posts if no authenticated user is found', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: null },
            error: { message: 'No authenticated user found'}
        });

        const result = await fetchPosts();

        expect(result).toEqual([]);

    });

    it('should return no posts if select fails', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: 'test-user-id' }
        });

        (supabase.eq as jest.Mock).mockResolvedValue({
            data: null,
            error: { message: 'Error fetching posts'},
        });

        const result = await fetchPosts();

        expect(result).toEqual([]);

    });
});