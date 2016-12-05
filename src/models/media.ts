import { MediaImage } from './media-image';

export interface Media{
    media_id: number;
    numLikes: number;
    numComments: number;
    numCommentsUnhandled: number;
    caption: string;
    image: MediaImage;
    link: string;
    datePosted: string;
}