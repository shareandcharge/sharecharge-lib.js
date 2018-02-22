export interface Connector {
    id: string;
    owner: string;
    lat: string;
    lng: string;
    price: number;
    model: number;
    plugType: number;
    openingHours: string;
    isAvailable: boolean;
}