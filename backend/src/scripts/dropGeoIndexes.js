import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Get the collections
      const db = mongoose.connection.db;
      
      // Get all collections
      const collections = await db.listCollections().toArray();
      
      // Process each collection
      for (const collection of collections) {
        const collectionName = collection.name;
        const collectionObj = db.collection(collectionName);
        
        console.log(`\nProcessing collection: ${collectionName}`);
        
        // Get all indexes for the collection
        const indexes = await collectionObj.indexes();
        console.log(`Current indexes for ${collectionName}:`, JSON.stringify(indexes, null, 2));
        
        // Drop all non-_id indexes
        for (const index of indexes) {
          if (index.name !== '_id_') {
            try {
              console.log(`Dropping index ${index.name} from ${collectionName}`);
              await collectionObj.dropIndex(index.name);
              console.log(`Successfully dropped index ${index.name} from ${collectionName}`);
            } catch (error) {
              console.error(`Error dropping index ${index.name} from ${collectionName}:`, error.message);
            }
          }
        }
      }
      
      // Recreate the correct indexes
      console.log('\nRecreating correct indexes...');
      
      // CarListing indexes
      const carListingCollection = db.collection('carlistings');
      await carListingCollection.createIndex({ 'location': 1 });
      console.log('Created index on carlistings.location');
      
      // Location indexes
      const locationCollection = db.collection('locations');
      await locationCollection.createIndex({ 'properties.district': 1, 'properties.subDistrict': 1 });
      console.log('Created index on locations.properties.district and locations.properties.subDistrict');
      
      // Rental indexes
      const rentalCollection = db.collection('rentals');
      await rentalCollection.createIndex({ 'pickupLocation.properties.district': 1, 'pickupLocation.properties.subDistrict': 1 });
      console.log('Created index on rentals.pickupLocation.properties.district and rentals.pickupLocation.properties.subDistrict');
      
      await rentalCollection.createIndex({ 'returnLocation.properties.district': 1, 'returnLocation.properties.subDistrict': 1 });
      console.log('Created index on rentals.returnLocation.properties.district and rentals.returnLocation.properties.subDistrict');
      
      console.log('\nAll indexes updated successfully');
    } catch (error) {
      console.error('Error updating indexes:', error);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 