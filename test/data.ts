export const connector = {
    id: '0x01',
    ownerName: 'Big Company',
    lat: '50',
    lng: '0',
    price: 10,
    priceModel: 2,
    plugType: 3,
    openingHours: '082020210022071305081418',
    isAvailable: false
};

export const registerParams = (client) => {
    return {
        id: connector.id,
        client,
        ownerName: connector.ownerName,
        lat: connector.lat,
        lng: connector.lng,
        price: connector.price,
        priceModel: connector.priceModel,
        plugType: connector.plugType,
        openingHours: connector.openingHours,
        isAvailable: connector.isAvailable
    };
}