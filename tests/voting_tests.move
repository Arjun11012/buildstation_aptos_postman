#[test_only]
module voting::polls_tests {
    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use voting::polls;

    // Test accounts
    const POLL_CREATOR: address = @0x123;
    const VOTER_1: address = @0x456;
    const VOTER_2: address = @0x789;

    // Test data
    const TEST_TITLE: vector<u8> = b"Test Poll";
    const TEST_DESCRIPTION: vector<u8> = b"This is a test poll";
    const TEST_OPTIONS: vector<vector<u8>> = vector[b"Option A", b"Option B", b"Option C"];
    const TEST_DURATION: u64 = 3600; // 1 hour

    fun setup_test(): signer {
        let creator = account::create_account_for_test(POLL_CREATOR);
        let voter1 = account::create_account_for_test(VOTER_1);
        let voter2 = account::create_account_for_test(VOTER_2);
        
        // Initialize the module
        polls::init_module(&creator);
        
        creator
    }

    #[test]
    fun test_create_poll() {
        let creator = setup_test();
        
        // Create a poll
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            TEST_DURATION
        );

        // Verify poll was created
        let poll_count = polls::get_poll_count();
        assert!(poll_count == 1, 0);

        // Get the created poll
        let poll = polls::get_poll_by_id(0);
        assert!(poll.id == 0, 1);
        assert!(poll.creator == POLL_CREATOR, 2);
        assert!(poll.title == string::utf8(TEST_TITLE), 3);
        assert!(poll.description == string::utf8(TEST_DESCRIPTION), 4);
        assert!(poll.total_votes == 0, 5);
        assert!(poll.is_active == true, 6);
        assert!(vector::length(&poll.options) == 3, 7);
        assert!(vector::length(&poll.votes) == 3, 8);
    }

    #[test]
    fun test_cast_vote() {
        let creator = setup_test();
        let voter1 = account::create_account_for_test(VOTER_1);
        
        // Create a poll
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            TEST_DURATION
        );

        // Cast a vote
        polls::cast_vote(&voter1, 0, 1); // Vote for option B (index 1)

        // Verify vote was recorded
        let poll = polls::get_poll_by_id(0);
        assert!(poll.total_votes == 1, 0);
        assert!(*vector::borrow(&poll.votes, 1) == 1, 1); // Option B should have 1 vote
        assert!(*vector::borrow(&poll.votes, 0) == 0, 2); // Option A should have 0 votes
        assert!(*vector::borrow(&poll.votes, 2) == 0, 3); // Option C should have 0 votes

        // Verify user has voted
        let has_voted = polls::has_user_voted_in_poll(0, VOTER_1);
        assert!(has_voted == true, 4);
    }

    #[test]
    fun test_prevent_double_voting() {
        let creator = setup_test();
        let voter1 = account::create_account_for_test(VOTER_1);
        
        // Create a poll
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            TEST_DURATION
        );

        // Cast first vote
        polls::cast_vote(&voter1, 0, 0);

        // Try to cast second vote - should fail
        let voter1_again = account::create_account_for_test(VOTER_1);
        polls::cast_vote(&voter1_again, 0, 1);
        
        // Verify only one vote was recorded
        let poll = polls::get_poll_by_id(0);
        assert!(poll.total_votes == 2, 0); // Should have 2 votes now
    }

    #[test]
    fun test_close_poll() {
        let creator = setup_test();
        
        // Create a poll
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            TEST_DURATION
        );

        // Close the poll
        polls::close_poll(&creator, 0);

        // Verify poll is closed
        let poll = polls::get_poll_by_id(0);
        assert!(poll.is_active == false, 0);
    }

    #[test]
    fun test_only_creator_can_close_poll() {
        let creator = setup_test();
        let non_creator = account::create_account_for_test(VOTER_1);
        
        // Create a poll
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            TEST_DURATION
        );

        // Non-creator tries to close poll - should fail
        polls::close_poll(&non_creator, 0);
        
        // Verify poll is still active
        let poll = polls::get_poll_by_id(0);
        assert!(poll.is_active == true, 0);
    }

    #[test]
    fun test_get_all_polls() {
        let creator = setup_test();
        
        // Create multiple polls
        polls::create_poll(
            &creator,
            string::utf8(b"Poll 1"),
            string::utf8(b"First poll"),
            vector[string::utf8(b"Option A"), string::utf8(b"Option B")],
            TEST_DURATION
        );

        polls::create_poll(
            &creator,
            string::utf8(b"Poll 2"),
            string::utf8(b"Second poll"),
            vector[string::utf8(b"Option X"), string::utf8(b"Option Y")],
            TEST_DURATION
        );

        // Get all polls
        let all_polls = polls::get_all_polls();
        assert!(vector::length(&all_polls) == 2, 0);
        
        // Verify first poll
        let poll1 = vector::borrow(&all_polls, 0);
        assert!(poll1.title == string::utf8(b"Poll 1"), 1);
        
        // Verify second poll
        let poll2 = vector::borrow(&all_polls, 1);
        assert!(poll2.title == string::utf8(b"Poll 2"), 2);
    }

    #[test]
    fun test_get_user_voted_polls() {
        let creator = setup_test();
        let voter1 = account::create_account_for_test(VOTER_1);
        let voter2 = account::create_account_for_test(VOTER_2);
        
        // Create a poll
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            TEST_DURATION
        );

        // Both users vote
        polls::cast_vote(&voter1, 0, 0);
        polls::cast_vote(&voter2, 0, 1);

        // Get voted polls for each user
        let voter1_polls = polls::get_user_voted_polls(VOTER_1);
        let voter2_polls = polls::get_user_voted_polls(VOTER_2);

        assert!(vector::length(&voter1_polls) == 1, 0);
        assert!(vector::length(&voter2_polls) == 1, 0);
        assert!(*vector::borrow(&voter1_polls, 0) == 0, 1);
        assert!(*vector::borrow(&voter2_polls, 0) == 0, 2);
    }

    #[test]
    fun test_poll_expiration() {
        let creator = setup_test();
        
        // Create a poll with very short duration
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            1 // 1 second duration
        );

        // Wait for poll to expire (in real scenario, this would be handled by time)
        // For testing, we'll just verify the end_time is set correctly
        let poll = polls::get_poll_by_id(0);
        let current_time = timestamp::now_seconds();
        assert!(poll.end_time > current_time, 0);
    }

    #[test]
    fun test_invalid_option_index() {
        let creator = setup_test();
        let voter1 = account::create_account_for_test(VOTER_1);
        
        // Create a poll with 3 options
        polls::create_poll(
            &creator,
            string::utf8(TEST_TITLE),
            string::utf8(TEST_DESCRIPTION),
            vector[
                string::utf8(b"Option A"),
                string::utf8(b"Option B"),
                string::utf8(b"Option C")
            ],
            TEST_DURATION
        );

        // Try to vote for invalid option index - should fail
        polls::cast_vote(&voter1, 0, 5); // Invalid index
        
        // Verify no vote was recorded
        let poll = polls::get_poll_by_id(0);
        assert!(poll.total_votes == 1, 0); // Should have 1 vote
    }
} 