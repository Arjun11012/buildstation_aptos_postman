// Types matching the Move smart contract
export interface Poll {
  id: number;
  creator: string;
  title: string;
  description: string;
  options: string[];
  votes: number[];
  total_votes: number;
  start_time: number;
  end_time: number;
  is_active: boolean;
  created_at: number;
}

export interface CreatePollData {
  title: string;
  description: string;
  options: string[];
  duration_seconds: number;
}

// Smart contract configuration
const MODULE_ADDRESS = '0x1'; // This will be updated after deployment
const MODULE_NAME = 'voting';
const MODULE_MODULE = 'polls';

// Helper function to create transaction payload
const createTransactionPayload = (
  functionName: string,
  typeArgs: string[] = [],
  args: any[] = []
) => {
  return {
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::${MODULE_MODULE}::${functionName}`,
    type_arguments: typeArgs,
    function_arguments: args,
  };
};

// Get all polls
export const getPolls = async (): Promise<Poll[]> => {
  try {
    const payload = createTransactionPayload('get_all_polls');
    
    // For now, we'll return mock data since the contract isn't deployed yet
    // In production, this would call the view function
    return getMockPolls();
  } catch (error) {
    console.error('Failed to get polls:', error);
    throw error;
  }
};

// Get poll by ID
export const getPollById = async (pollId: number): Promise<Poll> => {
  try {
    const payload = createTransactionPayload('get_poll_by_id', [], [pollId]);
    
    // For now, return mock data
    const mockPolls = getMockPolls();
    const poll = mockPolls.find(p => p.id === pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }
    return poll;
  } catch (error) {
    console.error('Failed to get poll by ID:', error);
    throw error;
  }
};

// Create a new poll
export const createPoll = async (pollData: CreatePollData): Promise<string> => {
  try {
    const payload = createTransactionPayload('create_poll', [], [
      pollData.title,
      pollData.description,
      pollData.options,
      pollData.duration_seconds,
    ]);

    // In production, this would submit the transaction
    console.log('Creating poll with payload:', payload);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock transaction hash
    return '0x' + Math.random().toString(36).substr(2, 64);
  } catch (error) {
    console.error('Failed to create poll:', error);
    throw error;
  }
};

// Cast a vote
export const castVote = async (pollId: number, optionIndex: number): Promise<string> => {
  try {
    const payload = createTransactionPayload('cast_vote', [], [pollId, optionIndex]);

    // In production, this would submit the transaction
    console.log('Casting vote with payload:', payload);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock transaction hash
    return '0x' + Math.random().toString(36).substr(2, 64);
  } catch (error) {
    console.error('Failed to cast vote:', error);
    throw error;
  }
};

// Close a poll (only creator can close)
export const closePoll = async (pollId: number): Promise<string> => {
  try {
    const payload = createTransactionPayload('close_poll', [], [pollId]);

    // In production, this would submit the transaction
    console.log('Closing poll with payload:', payload);
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock transaction hash
    return '0x' + Math.random().toString(36).substr(2, 64);
  } catch (error) {
    console.error('Failed to close poll:', error);
    throw error;
  }
};

// Check if user has voted in a specific poll
export const hasUserVoted = async (pollId: number, userAddress: string): Promise<boolean> => {
  try {
    const payload = createTransactionPayload('has_user_voted_in_poll', [], [pollId, userAddress]);
    
    // For now, return false (no votes yet)
    return false;
  } catch (error) {
    console.error('Failed to check user vote:', error);
    throw error;
  }
};

// Get user's voted polls
export const getUserVotedPolls = async (userAddress: string): Promise<number[]> => {
  try {
    const payload = createTransactionPayload('get_user_voted_polls', [], [userAddress]);
    
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Failed to get user voted polls:', error);
    throw error;
  }
};

// Mock data for development (remove in production)
const getMockPolls = (): Poll[] => {
  const now = Math.floor(Date.now() / 1000);
  
  return [
    {
      id: 1,
      creator: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      title: 'What should we build next?',
      description: 'Help us decide on the next major feature for our platform. Your vote matters!',
      options: ['Mobile App', 'Web Dashboard', 'API Integration', 'Blockchain Features'],
      votes: [45, 32, 18, 25],
      total_votes: 120,
      start_time: now - 86400, // 1 day ago
      end_time: now + 86400, // 1 day from now
      is_active: true,
      created_at: now - 86400,
    },
    {
      id: 2,
      creator: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      title: 'Community Governance Decision',
      description: 'Important decision about protocol parameters and community direction.',
      options: ['Option A', 'Option B', 'Option C'],
      votes: [67, 89, 34],
      total_votes: 190,
      start_time: now - 172800, // 2 days ago
      end_time: now + 86400, // 1 day from now
      is_active: true,
      created_at: now - 172800,
    },
    {
      id: 3,
      creator: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      title: 'Technical Architecture Vote',
      description: 'Vote on the proposed technical architecture changes for better scalability.',
      options: ['Microservices', 'Monolithic', 'Serverless', 'Hybrid Approach'],
      votes: [23, 12, 45, 31],
      total_votes: 111,
      start_time: now - 259200, // 3 days ago
      end_time: now - 86400, // 1 day ago
      is_active: false,
      created_at: now - 259200,
    },
  ];
}; 