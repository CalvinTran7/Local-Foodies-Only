const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const Spots = require('../models/spots');

mongoose.connect('mongodb://localhost:27017/local-foodies-only', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Spots.deleteMany({});
    for (let i = 0; i < 1; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const spot = new Spots({
            author: '61773e1fa2585eb1fd9477f4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aspernatur odio enim unde accusantium delectus totam. Fuga quia maiores nostrum eos repellat est, accusamus, illum aliquid molestias, tenetur magni modi sequi.',
            price: 'Medium',
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dztg6h4fg/image/upload/v1635310021/Local-Foodies-Only/friends_lcggpn.jpg',
                    filename: 'Local-Foodies-Only/friends_lcggpn.jpg'
                },
                {
                    url: "https://res.cloudinary.com/dztg6h4fg/image/upload/v1635313243/Local-Foodies-Only/friends2_uyhpjo.jpg",
                    filename: 'Local-Foodies-Only/friends2_uyhpjo.jpg'
                }
            ]
        })
        await spot.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})