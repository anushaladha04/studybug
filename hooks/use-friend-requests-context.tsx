import { createContext, useContext } from 'react';

export type FriendRequestsData = {
  pendingCount: number;
  refresh: () => Promise<void>;
};

export const FriendRequestsContext = createContext<FriendRequestsData>({
  pendingCount: 0,
  refresh: async () => {},
});

export const useFriendRequestsContext = () => useContext(FriendRequestsContext);
