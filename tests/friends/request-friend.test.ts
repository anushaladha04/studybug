import { requestFriend } from '@/controllers/friends';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn()
    },
}));

beforeEach(() => {
    jest.clearAllMocks()
});

describe(('requestFriend'), () => {
    it('should call the friends database', async () => {
        const mockFriends = [{}];
        (supabase.from('friends').select as jest.Mock).mockResolvedValue({
            data: mockFriends,
            error: null,
        });

        const result = await requestFriend('test');

        expect(supabase.from).toHaveBeenCalledWith('friends');
    });
});