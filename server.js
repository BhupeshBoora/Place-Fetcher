import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

dotenv.config();
const db = new pg.Client
({
  user: process.env.DATABASE_USER,
  host: "localhost",
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT
});

db.connect();

app.listen(process.env.APP_PORT, () =>
{
    console.log(`Server is running on Port: ${process.env.APP_PORT}`);
});

app.get("/", (req, res) =>
{
    res.render("index.ejs");
});

app.get("/listPlaces/:latitude/:longitude", async (req, res) =>
{
    const latitude = parseFloat(req.params.latitude);
    const longitude = parseFloat(req.params.longitude);
    
    try
    {
        const result = await db.query("SELECT * FROM place_info");
        if (result.rowCount > 0)
        {
            const places = result.rows;
            
            const placesInOrder = sortSchools(latitude, longitude, places);
            res.status(200).send(placesInOrder);

        } else
        {
            res.status(404).json({message: "No places added in the database"});
        }
        
    } catch (error)
    {
        res.status(500).json({message: "There was an issue while processing your request"});
        console.log(error.message);
    }

});

app.post("/addPlace", async (req, res) =>
{
    const name = req.body.name;
    const address = req.body.address;
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);

    if (!name || !address || latitude === undefined || longitude === undefined)
    {
        return res.status(400).json({ message: "All fields are required: (name, address, latitude, longitude)" });
    }

    if (typeof name !== "string" || typeof address !== "string")
    {
        return res.status(400).json({ message: "Name and address must be strings" });
    }

    if (isNaN(latitude) || isNaN(longitude) )
    {
        return res.status(400).json({ message: "Latitude and longitude must be numbers" });
    }

    try
    {
        const insertedData = await db.query("INSERT INTO place_info (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, address, latitude, longitude]);

        res.status(201).json({message: "Following place was inserted in the database:", place: insertedData.rows[0]});

    } catch (error)
    {
        res.status(500).json({message: "There was an issue while processing your request"});
    }    
});

function toRadians(degrees)
{
    return degrees * (Math.PI / 180);
}

function getHaversineDistance(lat1, lon1, lat2, lon2)
{
    const R = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * 
        Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function sortSchools(userLat, userLong, places)
{
    const arrayOfSortedPlaces = places.map(place =>
    {
        const distance = getHaversineDistance(userLat, userLong, place.latitude, place.longitude);

        return {
            placeName: place.name,
            placeDistance: Math.floor(distance)
        };
    });

    arrayOfSortedPlaces.sort((a, b) => a.placeDistance - b.placeDistance);

    return arrayOfSortedPlaces;
}