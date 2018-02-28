export const connector = {
    id: '0x01',
    owner: 'Big Company',
    lat: '50',
    lng: '0',
    price: 10,
    model: 2,
    plugType: 3,
    openingHours: '082020210022071305081418',
    isAvailable: false
};

export const registerParams = (client) => {
    return {
        id: connector.id,
        client,
        owner: connector.owner,
        lat: connector.lat,
        lng: connector.lng,
        price: connector.price,
        model: connector.model,
        plugType: connector.plugType,
        openingHours: connector.openingHours,
        isAvailable: connector.isAvailable
    };
};