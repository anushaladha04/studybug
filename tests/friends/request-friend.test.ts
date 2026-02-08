import { requestFriend } from '@/controllers/friends';
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

describe(('requestFriend'), () => {
    it('should update the sender\'s to_ids and receiver\'s from_ids', async () => {
        const mockFriends = [
            {
                user_id: 'test-user-id-1',
                friends_ids: [],
                from_ids: [],
                to_ids: ['test-user-id-2'],
            },
            {
                user_id: 'test-user-id-2',
                friends_ids: [],
                from_ids: ['test-user-id-1'],
                to_ids: [],
            },

        ];

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'test-user-id-1' } },
        });
        
        (supabase.rpc as jest.Mock).mockResolvedValue({
            data: mockFriends,
            error: null,
        });

        const result = await requestFriend('test-user-id-2');

        expect(supabase.auth.getUser).toHaveBeenCalled();
        expect(supabase.rpc).toHaveBeenCalledWith(
            'send_friend_request', 
            {
                sender_id: 'test-user-id-1',
                receiver_id: 'test-user-id-2'
            }
        );
        expect(result).toEqual(mockFriends);
    });

    it('should return null if receiver does not exist', async () => {

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'test-user-id-1' } },
        });
        
        (supabase.rpc as jest.Mock).mockResolvedValue({
            data: null,
            error: { message: 'db error'},
        });

        const result = await requestFriend('test-user-id-2');
        expect(result).toBeNull();
    });


});