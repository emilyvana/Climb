const mongoose = require('mongoose');
const Wall = require('./models/wall'); // from book, ref back to wallschema
const Location = require('./models/location'); // from auther, ref back to location schema
const Climb = require('./models/climb'); // from genre, ref abck to climb schema

// MongoDB Atlas connection string
const atlasUri = 'mongodb+srv://emilyjvana:60Vy6HMNEoOCnruq@cluster0.udpkcxe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas database
mongoose.connect(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    populateDatabase();
  })
  .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Function to populate the database
async function populateDatabase() {
  try {
    // 1. Create Wall documents
    console.log('Creating walls...');
    const islandWall = await Wall.create({ type: 'island', description: 'center island' });
    const slabWall = await Wall.create({ type: 'slab', description: 'sketchy slab' });
	 const caveWall = await Wall.create({ type: 'cave', description: 'upside down cave' });
	  const overhangWall = await Wall.create({ type: 'slab', description: 'its the 45' });

    console.log('Walls created:', islandWall, slabWall);

    // 2. Create Location documents
    console.log('Creating locations...');
    const lbrLocation = await Location.create({ gymName: 'LBR', wall: islandWall._id });
    console.log('Location created:', lbrLocation);

    // 3. Create Climb documents and associate them with Locations and Walls
    console.log('Creating climbs...');
    const climb3 = await Climb.create({
      climb: 3,
      location: lbrLocation._id,
      climbedDate: new Date('2025-06-15')
    });
    console.log('Climb 3 created:', climb3);

    // Update location to refer to the 'slab' wall for the second climb
    lbrLocation.wall = slabWall._id;
    await lbrLocation.save();

    const climb4 = await Climb.create({
      climb: 4,
      location: lbrLocation._id,
      climbedDate: new Date('2025-06-16')
    });
    console.log('Climb 4 created:', climb4);

    console.log('Database populated successfully!');
  } catch (err) {
    console.error('Error populating database:', err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}