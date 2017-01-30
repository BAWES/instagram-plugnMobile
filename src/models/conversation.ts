
export interface Conversation{
    comment_id: number;
    media_id: number;
    user_id: number;
    agent_id: number;
    comment_instagram_id: number;
    comment_text: string;
    comment_by_username: string;
    comment_by_photo: string;
    comment_by_id: string;
    comment_by_fullname: string;
    comment_handled: boolean;
    comment_handled_by: string;
    comment_deleted: boolean;
    comment_deleted_by: string;
    comment_deleted_reason: string;
    comment_notification_email_sent: string;
    comment_datetime: string;
    unhandledCount: string;
    isLoading: boolean;
}