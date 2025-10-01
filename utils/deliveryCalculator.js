const { Client } = require('@googlemaps/google-maps-services-js');
const client = new Client({});

const calculateDeliveryFee = async (originAddress, destinationAddress) => {
  try {
    // Get coordinates for both addresses
    const originCoords = await getCoordinates(originAddress);
    const destinationCoords = await getCoordinates(destinationAddress);
    
    if (!originCoords || !destinationCoords) {
      throw new Error('Could not geocode addresses');
    }

    // Calculate distance using Google Maps Distance Matrix
    const distanceResponse = await client.distancematrix({
      params: {
        origins: [`${originCoords.lat},${originCoords.lng}`],
        destinations: [`${destinationCoords.lat},${destinationCoords.lng}`],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000,
    });

    const distanceElement = distanceResponse.data.rows[0].elements[0];
    
    if (distanceElement.status !== 'OK') {
      throw new Error('Could not calculate distance');
    }

    const distanceInMeters = distanceElement.distance.value;
    const distanceInKm = distanceInMeters / 1000;
    const roundedDistance = Math.round(distanceInKm * 100) / 100;

    console.log(`Distance: ${roundedDistance}km`);

    // Delivery logic: £2.5 base fee + £0.5 per km up to 5km, collection beyond 5km
    if (roundedDistance <= 5) {
      const baseFee = 2.5;
      const perKmFee = 0.5;
      const deliveryFee = baseFee + (roundedDistance * perKmFee);
      
      return {
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        baseFee: baseFee,
        perKmFee: perKmFee,
        distance: roundedDistance,
        deliveryType: 'delivery',
        calculation: `£${baseFee} base + £${perKmFee} × ${roundedDistance}km`
      };
    } else {
      return {
        deliveryFee: 0, // No delivery fee for collection
        distance: roundedDistance,
        deliveryType: 'collection',
        message: `Collection only (${roundedDistance}km exceeds 5km delivery range)`
      };
    }
  } catch (error) {
    console.error('Delivery calculation error:', error);
    throw new Error('Failed to calculate delivery fee');
  }
};

const getCoordinates = async (address) => {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 1000,
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

module.exports = {
  calculateDeliveryFee
};