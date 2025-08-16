module voting::polls {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use aptos_framework::event;

    // Error codes
    const ENOT_POLL_CREATOR: u64 = 1;
    const EPOLL_NOT_FOUND: u64 = 2;
    const EPOLL_ALREADY_VOTED: u64 = 3;
    const EPOLL_CLOSED: u64 = 4;
    const EINVALID_OPTION: u64 = 5;
    const EPOLL_NOT_CLOSED: u64 = 6;
    const EPOLL_ALREADY_EXISTS: u64 = 7;

    // Structs
    struct Poll has key, store {
        id: u64,
        creator: address,
        title: String,
        description: String,
        options: vector<String>,
        votes: vector<u64>,
        total_votes: u64,
        start_time: u64,
        end_time: u64,
        is_active: bool,
        created_at: u64,
    }

    struct Vote has key, store {
        poll_id: u64,
        voter: address,
        option_index: u64,
        voted_at: u64,
    }

    struct PollStore has key {
        polls: vector<Poll>,
        next_poll_id: u64,
    }

    struct UserVotes has key {
        voted_polls: vector<u64>,
    }

    // Events
    struct PollCreatedEvent has drop, store {
        poll_id: u64,
        creator: address,
        title: String,
        options: vector<String>,
        start_time: u64,
        end_time: u64,
    }

    struct VoteCastEvent has drop, store {
        poll_id: u64,
        voter: address,
        option_index: u64,
        timestamp: u64,
    }

    struct PollClosedEvent has drop, store {
        poll_id: u64,
        total_votes: u64,
        results: vector<u64>,
        timestamp: u64,
    }

    // Initialize the module
    fun init_module(account: &signer) {
        let poll_store = PollStore {
            polls: vector::empty(),
            next_poll_id: 0,
        };
        move_to(account, poll_store);
    }

    // Create a new poll
    public entry fun create_poll(
        account: &signer,
        title: String,
        description: String,
        options: vector<String>,
        duration_seconds: u64,
    ) acquires PollStore {
        let poll_store = borrow_global_mut<PollStore>(@voting);
        let poll_id = poll_store.next_poll_id;
        poll_store.next_poll_id = poll_store.next_poll_id + 1;

        let current_time = timestamp::now_seconds();
        let end_time = current_time + duration_seconds;

        let poll = Poll {
            id: poll_id,
            creator: signer::address_of(account),
            title,
            description,
            options,
            votes: vector::empty(),
            total_votes: 0,
            start_time: current_time,
            end_time,
            is_active: true,
            created_at: current_time,
        };

        // Initialize votes vector with zeros for each option
        let options_count = vector::length(&poll.options);
        let i = 0;
        while (i < options_count) {
            vector::push_back(&mut poll.votes, 0);
            i = i + 1;
        };

        vector::push_back(&mut poll_store.polls, poll);

        // Emit event
        let poll_created_event = PollCreatedEvent {
            poll_id,
            creator: signer::address_of(account),
            title: poll.title,
            options: poll.options,
            start_time: poll.start_time,
            end_time: poll.end_time,
        };
        event::emit(poll_created_event);
    }

    // Cast a vote
    public entry fun cast_vote(
        account: &signer,
        poll_id: u64,
        option_index: u64,
    ) acquires PollStore, UserVotes {
        let poll_store = borrow_global_mut<PollStore>(@voting);
        let poll = get_poll_by_id_mut(poll_store, poll_id);
        
        // Check if poll is active
        assert!(poll.is_active, EPOLL_CLOSED);
        
        // Check if poll has ended
        let current_time = timestamp::now_seconds();
        assert!(current_time <= poll.end_time, EPOLL_CLOSED);
        
        // Check if option is valid
        let options_count = vector::length(&poll.options);
        assert!(option_index < options_count, EINVALID_OPTION);
        
        // Check if user has already voted
        let voter = signer::address_of(account);
        assert!(!has_user_voted(poll_id, voter), EPOLL_ALREADY_VOTED);
        
        // Record the vote
        let current_votes = *vector::borrow(&poll.votes, option_index);
        *vector::borrow_mut(&mut poll.votes, option_index) = current_votes + 1;
        poll.total_votes = poll.total_votes + 1;
        
        // Record user vote
        if (!exists<UserVotes>(voter)) {
            let user_votes = UserVotes {
                voted_polls: vector::empty(),
            };
            move_to(account, user_votes);
        };
        
        let user_votes = borrow_global_mut<UserVotes>(voter);
        vector::push_back(&mut user_votes.voted_polls, poll_id);
        
        // Emit event
        let vote_cast_event = VoteCastEvent {
            poll_id,
            voter,
            option_index,
            timestamp: current_time,
        };
        event::emit(vote_cast_event);
    }

    // Close a poll (only creator can close)
    public entry fun close_poll(
        account: &signer,
        poll_id: u64,
    ) acquires PollStore {
        let poll_store = borrow_global_mut<PollStore>(@voting);
        let poll = get_poll_by_id_mut(poll_store, poll_id);
        
        // Check if caller is the poll creator
        assert!(signer::address_of(account) == poll.creator, ENOT_POLL_CREATOR);
        
        // Check if poll is already closed
        assert!(poll.is_active, EPOLL_NOT_CLOSED);
        
        poll.is_active = false;
        
        // Emit event
        let poll_closed_event = PollClosedEvent {
            poll_id,
            total_votes: poll.total_votes,
            results: poll.votes,
            timestamp: timestamp::now_seconds(),
        };
        event::emit(poll_closed_event);
    }

    // Get poll by ID
    fun get_poll_by_id_mut(poll_store: &mut PollStore, poll_id: u64): &mut Poll {
        let i = 0;
        let polls_length = vector::length(&poll_store.polls);
        
        while (i < polls_length) {
            let poll = vector::borrow_mut(&mut poll_store.polls, i);
            if (poll.id == poll_id) {
                return poll
            };
            i = i + 1;
        };
        
        abort EPOLL_NOT_FOUND
    }

    // Check if user has voted in a specific poll
    fun has_user_voted(poll_id: u64, voter: address): bool {
        if (!exists<UserVotes>(voter)) {
            return false
        };
        
        let user_votes = borrow_global<UserVotes>(voter);
        let i = 0;
        let voted_polls_length = vector::length(&user_votes.voted_polls);
        
        while (i < voted_polls_length) {
            let voted_poll_id = *vector::borrow(&user_votes.voted_polls, i);
            if (voted_poll_id == poll_id) {
                return true
            };
            i = i + 1;
        };
        
        false
    }

    // View functions
    #[view]
    public fun get_poll_count(): u64 acquires PollStore {
        let poll_store = borrow_global<PollStore>(@voting);
        vector::length(&poll_store.polls)
    }

    #[view]
    public fun get_poll_by_id(poll_id: u64): Poll acquires PollStore {
        let poll_store = borrow_global<PollStore>(@voting);
        let i = 0;
        let polls_length = vector::length(&poll_store.polls);
        
        while (i < polls_length) {
            let poll = vector::borrow(&poll_store.polls, i);
            if (poll.id == poll_id) {
                return *poll
            };
            i = i + 1;
        };
        
        abort EPOLL_NOT_FOUND
    }

    #[view]
    public fun get_all_polls(): vector<Poll> acquires PollStore {
        let poll_store = borrow_global<PollStore>(@voting);
        poll_store.polls
    }

    #[view]
    public fun has_user_voted_in_poll(poll_id: u64, voter: address): bool {
        has_user_voted(poll_id, voter)
    }

    #[view]
    public fun get_user_voted_polls(user: address): vector<u64> acquires UserVotes {
        if (!exists<UserVotes>(user)) {
            return vector::empty()
        };
        
        let user_votes = borrow_global<UserVotes>(user);
        user_votes.voted_polls
    }
} 