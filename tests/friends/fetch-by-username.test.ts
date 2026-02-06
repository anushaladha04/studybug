import { fetchByUsername } from '@/controllers/friends';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
    },
}));

beforeEach(() => {
    jest.clearAllMocks()
})

describe('fetchByUsername', () => {
    it('should return return all rows from profiles where the username matches the search pattern', async () => {
        const mockProfiles = [
            {
                id: 'test-user-id-1',
                username: 'test-username-1',
                full_name: 'Test User 1'
            },
            {
                id: 'test-user-id-2',
                username: 'test-username-2',
                full_name: 'Test User 2'
            }
        ];

        (supabase.from('profiles').select('*').ilike as jest.Mock).mockResolvedValue({
            data: mockProfiles,
            error: null,
        });

        const result = await fetchByUsername('test');

        expect(supabase.from).toHaveBeenCalledWith('profiles');

        expect(supabase.from('profiles').select('*').ilike).toHaveBeenCalledWith(
            'username', 
            'test%'
        );

        expect(result).toEqual([
            {
                id: 'test-user-id-1',
                username: 'test-username-1',
                full_name: 'Test User 1'
            },
            {
                id: 'test-user-id-2',
                username: 'test-username-2',
                full_name: 'Test User 2'
            }
        ]);
    });

});
