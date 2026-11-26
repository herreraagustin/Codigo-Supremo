export type Movie = {
    id: string;
    name: string;
    description: string;
    category: string;
    image: string;
    published: boolean;
    isFeatured: boolean;
    year?: number | string;
    duration?: number;
    rating?: number | string; 
}