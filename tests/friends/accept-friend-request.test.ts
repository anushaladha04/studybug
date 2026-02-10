import { acceptFriendRequest } from '@/controllers/friends';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn()
        },
        rpc: jest.fn()
    },
}));

beforeEach(() => {
    jest.clearAllMocks()
});

describe(('acceptFriendRequest'), () => {
    it('should update both users\' friends lists and update the sender\'s to_ids and receiver\'s from_ids', async () => {
        const mockFriends = [
            {
                user_id: 'test-user-id-1',
                friends_ids: ['test-user-id-2'],
                from_ids: [],
                to_ids: [],
            },
            {
                user_id: 'test-user-id-2',
                friends_ids: ['test-user-id-1'],
                from_ids: [],
                to_ids: [],
            }
        ];

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'test-user-id-2' } },
        });
                
        (supabase.rpc as jest.Mock).mockResolvedValue({
            data: mockFriends,
            error: null,
        });
        
        const result = await acceptFriendRequest('test-user-id-1');

        expect(supabase.auth.getUser).toHaveBeenCalled();
        expect(supabase.rpc).toHaveBeenCalledWith(
            'accept_friend_request', 
            {
                original_sender_id: 'test-user-id-1',
                curr_user_id: 'test-user-id-2'
            }
        );
        expect(result).toEqual(mockFriends);
    });

    it('should return null if request is invalid', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'test-user-id-2' } },
        });
                
        (supabase.rpc as jest.Mock).mockResolvedValue({
            data: [],
            error: { message: 'db error'},
        });
        
        const result = await acceptFriendRequest('test-user-id-1');
        expect(result).toEqual([]);
    });
});