
export class Note{
    id: number;
    userId: number; // Instagram account user id
    noteAboutUsername: string;
    title: string;
    content: string;
    created_by: string;
    updated_by: string;
    created_datetime: string;
    updated_datetime: string;
    isDeleting: boolean; // to show deletion progress where needed
}