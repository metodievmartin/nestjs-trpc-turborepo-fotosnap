export interface SuggestedUser {
  id: string;
  username: string;
  avatar: string;
  followedBy: string;
}

export const mockSuggestions: SuggestedUser[] = [
  {
    id: '1',
    username: 'alexsmith',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    followedBy: 'johndoe',
  },
  {
    id: '2',
    username: 'sarahwilson',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
    followedBy: 'janedoe',
  },
  {
    id: '3',
    username: 'mikejohnson',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    followedBy: 'photographer',
  },
  {
    id: '4',
    username: 'emilydavis',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    followedBy: 'photographer',
  },
  {
    id: '5',
    username: 'davidbrown',
    avatar:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=40&h=40&fit=crop&crop=face',
    followedBy: 'traveler',
  },
];
