    import express from 'express'
    const app = express()
    const port = 5000
    import mongoose from "mongoose";
    import { UserLogin } from "./models/userlogin.js";
    import { OrganisationLogin } from "./models/organisationlogin.js";
    import { Event } from "./models/events.js";
    import cors from "cors";
    import dotenv from "dotenv";
    import bcrypt from "bcrypt"
    import main from './chat.js';

    dotenv.config();
    const hash = async (password) => {
        const hashedpassword = await bcrypt.hash(password, 10)
        return hashedpassword
    }
    app.use(express.json());
    app.use(cors());
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("Connected to MongoDB");
            app.listen(port, () => {
                console.log(`Server running on port ${port}`);
            });
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB", err);
        });



    app.post('/usersignin', async (req, res) => {
        const { username, password, mobileNumber, Location } = req.body;

        try {
            console.log("Received user signin request:", req.body);
            const user = await UserLogin.findOne({ username: username });
            if (user) {
                console.log("User already exists");
                return res.status(400).json({ message: "User already exists" });
            }
            const hashedpassword = await hash(password)
            const newUser = new UserLogin({
                username: username,
                password: hashedpassword,
                mobileNumber: mobileNumber,
                Location: Location
            });

            await newUser.save();
            console.log("User saved successfully");
            return res.status(200).json({ message: "User saved successfully" });

        } catch (err) {
            console.error("Error saving/finding user", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

    app.post('/getevents', async (req, res) => {
        const { name, type } = req.body
        if (type === "user") {
            const data = await UserLogin.findOne({ username: name })
            if (!data) {
                return res.status(400).json({ message: "User not found" })
            }
            return res.status(200).json({ events: data.Events })
        }
        else if (type === "organisation") {
            const data = await OrganisationLogin.findOne({ organisationname: name })
            if (!data) {
                return res.status(400).json({ message: "Organisation not found" })
            }
            return res.status(200).json({ events: data.eventHistory })
        }
    })

    app.post('/organisationsignin', async (req, res) => {
        const { organisationname, password, email, mobileNumber, Location } = req.body;

        try {
            const user = await OrganisationLogin.findOne({ organisationname: organisationname });
            if (user) {
                console.log("Organisation already exists");
                return res.status(400).json({ message: "Organisation already exists" });
            }
            const hashedpassword = await hash(password)
            const lastid = await OrganisationLogin.findOne().sort({ _id: -1 }).limit(1);
            const newId = lastid ? parseInt(lastid.organisationId) + 1 : 1;
            const newUser = new OrganisationLogin({
                organisationId: newId.toString(),
                organisationname: organisationname,
                password: hashedpassword,
                mobileNumber: mobileNumber,
                email: email,
                Location: Location,
                eventHistory: []
            });
            await fetch("https://adityabr.app.n8n.cloud/webhook/0b37dd82-a4e6-4ff4-abb5-f3620c61c9f8", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: organisationname,
                    email: email
                })
            })


            await newUser.save();
            console.log("Organisation saved successfully");
            return res.status(200).json({ message: "Organisation saved successfully" });

        } catch (err) {
            console.error("Error saving/finding organisation", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    });

    app.post('/chatsend', async (req, res) => {
        const message = req.body
        console.log("Received message for AI:", message)
        const reply = await main({ usermessage: message })
        res.status(200).json({ message: "Message sent to AI", reply: reply })

    })

    app.post('/eventcreate', async (req, res) => {
        console.log("Received event creation request:", req.body)
        const { name, description, price, date, time, tickets, type,organisationname,organisationlocation } = req.body
        const eventpresent = await Event.findOne({ eventName: name, eventDate: date, eventTime: time })
        const organisation = await OrganisationLogin.findOne({ organisationname: organisationname, Location: organisationlocation})
        if(!organisation){
            console.log("Organisation not found for event creation:", organisationname, organisationlocation)
            return res.status(400).json({ message: "Organisation not found" })
        }
        if (eventpresent) {
            console.log("Event with same name, date and time already exists:", name, date, time)
            return res.status(400).json({ message: "Event with same name,date and time already exists" })
        }
        else {
            try {
                const eventid = Math.floor(Math.random() * 1000000)
                let idpresent = await Event.findOne({ eventId: eventid.toString() })
                while (idpresent) {
                    eventid = Math.floor(Math.random() * 1000000)
                    idpresent = await Event.findOne({ eventId: eventid.toString() })
                }
                const newEvent = new Event({
                    eventId: eventid.toString(),
                    eventName: name,
                    eventDescription: description,
                    ticketPrice: price,
                    eventDate: date,
                    eventTime: time,
                    ticketsAvailable: tickets,
                    totaltickets: tickets,
                    eventtype: type,
                    organisationID: organisation._id
                })
                await newEvent.save();
                console.log("Event created successfully with ID:", eventid.toString())
                return res.status(200).json({
                    message: "Event created successfully", eventId: eventid.toString()
                })
            }catch(arr){
                console.error("Error creating event", arr);
                return res.status(500).json({ message: "Internal server error" });
            }
        }

    })
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
