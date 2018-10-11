import { Tariff } from '@motionwerk/sharecharge-common';
import { ShareCharge, ToolKit } from '../../src/index';
import config from '../config/example';

const sc = ShareCharge.getInstance(config);

// must be obtained beforehand
const cpoId = '0x3d3e776f83ccf6aa443b8bd5b6f245dd429f94e9';

// get location ids for a particular CPO
sc.store.getIdsByCPO(cpoId)
    .then((ids: string[]) => {
        // ids are a function of their coordinates - this allows locations to be shown on a map without their full data being retrieved
        const coordinates = ids.map(id => ToolKit.scIdToGeolocation(id));
        // display coordinates on map
        console.log('coordinates:', JSON.stringify(coordinates, undefined, 2));
    });


// subscribe to location update events e.g. if storing locations in a local database for caching purposes
sc.on('LocationUpdated', async (info: { cpo: string, scId: string }) => {
    // note that events are completely public, here it is necessary to filter by CPO
    if (info.cpo === cpoId) {
        // retrieve the updated location data
        const location = await sc.store.getLocationById(info.cpo, info.scId);
        // update location in database
        console.log('location:', location);
    }
});

// get tariffs for a particular CPO
sc.store.getAllTariffsByCPO(cpoId)
    .then((tariffs: { [id: string]: Tariff }) => {
        // select tariff
        const tariff = tariffs['1'];
        // calculate price of flat rate tariff for 1 hour
        const price = tariff.calculatePrice('FLAT', 3600);
        console.log('price:', price);
    });