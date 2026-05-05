import { fetchFriendRequests } from '@/controllers/friends';
import { FriendRequestsContext } from '@/hooks/use-friend-requests-context';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useAuthContext } from '@/hooks/use-auth-context';

export default function FriendRequestsProvider({ children }: PropsWithChildren) {
  const { session } = useAuthContext();
  const [pendingCount, setPendingCount] = useState(0);

  const refresh = async () => {
    const data = await fetchFriendRequests();
    setPendingCount(data.length);
  };

  useEffect(() => {
    if (session) {
      refresh();
    } else {
      setPendingCount(0);
    }
  }, [session]);

  return (
    <FriendRequestsContext.Provider value={{ pendingCount, refresh }}>
      {children}
    </FriendRequestsContext.Provider>
  );
}
