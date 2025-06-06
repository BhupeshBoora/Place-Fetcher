import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

dotenv.config();
const db = new pg.Client
({
  connectionString: process.env.DATABASE_URL,
  ssl:
  {
    rejectUnauthorized: false
  }
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

app.get("/listSchools/:latitude/:longitude", async (req, res) =>
{
    const latitude = parseFloat(req.params.latitude);
    const longitude = parseFloat(req.params.longitude);
    
    try
    {
        const result = await db.query("SELECT * FROM school_info");
        if (result.rowCount > 0)
        {
            const schools = result.rows;
            
            const schoolsInOrder = sortSchools(latitude, longitude, schools);
            res.status(200).send(schoolsInOrder);

        } else
        {
            res.status(404).json({message: "No schools added in the database"});
        }
        
    } catch (error)
    {
        res.status(500).json({message: "There was an issue while processing your request"});
        console.log(error.message);
    }

});

app.post("/addSchool", async (req, res) =>
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
        const insertedData = await db.query("INSERT INTO school_info (name, address, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, address, latitude, longitude]);

        res.status(201).json({message: "Following school was inserted in the database:", school: insertedData.rows[0]});

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

function sortSchools(userLat, userLong, schools)
{
    const arrayOfSortedSchools = schools.map(school =>
    {
        const distance = getHaversineDistance(userLat, userLong, school.latitude, school.longitude);

        return {
            schoolName: school.name,
            schoolDistance: Math.floor(distance)
        };
    });

    arrayOfSortedSchools.sort((a, b) => a.schoolDistance - b.schoolDistance);

    return arrayOfSortedSchools;
}