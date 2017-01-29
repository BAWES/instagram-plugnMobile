import { Assignment } from './assignment';

export interface InstagramAccount{
    user_id: number;
    agent_id: number;
    user_name: string;
    user_fullname: string;
    user_profile_pic: string;
    user_bio: string;
    user_website: string;
    user_media_count: number;
    user_following_count: number;
    user_follower_count: number;
    user_instagram_id: number;
    user_status: number;
    unhandledCount: number;
    lastAgentActivity: string;
    assignments: Assignment[];
}