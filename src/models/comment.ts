
export interface Comment{
    comment_id: number;
    media_id: number;
    user_id: number;
    agent_id: number;
    comment_instagram_id: string;
    comment_text: string;
    comment_by_username: string;
    comment_by_photo: string;
    comment_by_id: string;
    comment_by_fullname: string;
    comment_handled: string;
    comment_handled_by: string;
    comment_deleted: string;
    comment_deleted_by: string;
    comment_deleted_reason: string;
    comment_notification_email_sent: string;
    comment_datetime: string;
    agent_name: string;
    handler_name: string;
    deleter_name: string;
    commentType: string;
}