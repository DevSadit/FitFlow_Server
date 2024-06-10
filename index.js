const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.irm8dks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const testimonialCollection = client
      .db(`Fitness_Tracker`)
      .collection(`testimonials`);
    const postCollection = client.db(`Fitness_Tracker`).collection(`posts`);
    const trainerCollection = client
      .db(`Fitness_Tracker`)
      .collection(`trainers`);
    const userCollection = client.db(`Fitness_Tracker`).collection(`users`);
    const classCollection = client.db(`Fitness_Tracker`).collection(`classes`);
    const newsletterUserCollection = client
      .db(`Fitness_Tracker`)
      .collection(`newsletter`);

    //   get the testimonials from database
    app.get(`/testimonials`, async (req, res) => {
      const result = await testimonialCollection.find().toArray();
      res.send(result);
    });

    //   get the posts from database
    app.get(`/posts`, async (req, res) => {
      const result = await postCollection.find().toArray();
      res.send(result);
    });

    // get the accepted trainers data from database
    app.get(`/trainers`, async (req, res) => {
      const query = { status: `Accepted` };
      const result = await trainerCollection.find(query).toArray();
      res.send(result);
    });

    // ///////////////////////////////////////////////////////////
    app.patch("/trainer/update/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;

      const trainerQuery = { email };
      const updateDoc = {
        $set: { ...user },
      };

      try {
        // Update the trainer collection
        const trainerUpdateResult = await trainerCollection.updateOne(
          trainerQuery,
          updateDoc
        );

        if (trainerUpdateResult.matchedCount > 0) {
          const userQuery = { email };
          const updateUserRole = {
            $set: { ...user },
          };

          // Update the user collection
          const userUpdateResult = await userCollection.updateOne(
            userQuery,
            updateUserRole
          );

          res.send({
            trainerUpdateResult,
            userUpdateResult,
          });
        } else {
          res.status(404).send({ error: "Trainer not found" });
        }
      } catch (error) {
        res.status(500).send({
          error: "An error occurred while updating the data",
          details: error.message,
        });
      }
    });

    // ////////////////////////////////////////////////////////////

    // update a member to trainer
    // app.patch(`/trainer/update/:email`, async (req, res) => {
    //   const email = req.params.email;
    //   user = req.body;
    //   const query = { email };
    //   const updateDoc = {
    //     $set: { ...user },
    //   };
    //   const result = await trainerCollection.updateOne(query, updateDoc);
    //   res.send(result);
    // });

    // get real trainers and applied trainers based on status
    app.get(`/trainers/:status`, async (req, res) => {
      const status = req.params.status;
      // console.log(status);

      const result = await trainerCollection.find({ status }).toArray();
      res.send(result);
    });

    // getting trainer with selected id
    app.get(`/trainer/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      // console.log(query);
      const result = await trainerCollection.findOne(query);
      res.send(result);
    });

    // getting user info with selected email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    // get all users data
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    // get the subscribed newsletter users
    app.get("/newsletter", async (req, res) => {
      const result = await newsletterUserCollection.find().toArray();
      res.send(result);
    });

    // get the class data from db
    app.get("/classes", async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    //
    // getting teacher info based on category from db
    app.get("/classTrainer/:category", async (req, res) => {
      const category = req.params.category;
      const result = await trainerCollection.find({category}).toArray();
      // const result = await trainerCollection.find({ category }).toArray();
      res.send(result);
    });
    //

    // Delete trainer from db
    app.delete("/trainer/:id", async (req, res) => {
      const trainerId = req.params.id;
      const query = { _id: new ObjectId(trainerId) };
      const result = await trainerCollection.deleteOne(query);
      res.send(result);
    });

    // post trainers to db
    app.post("/trainers", async (req, res) => {
      const trainerInfo = req.body;
      const result = trainerCollection.insertOne(trainerInfo);
      res.send(result);
    });

    // post newsletter users to db
    app.post("/newsletter", async (req, res) => {
      const newsletterUser = req.body;
      const result = newsletterUserCollection.insertOne(newsletterUser);
      res.send(result);
    });

    // post class data by admin to db
    app.post("/classes", async (req, res) => {
      const classInfo = req.body;
      const result = classCollection.insertOne(classInfo);
      res.send(result);
    });

    //
    app.post("/users", async (req, res) => {
      const userInfo = req.body;
      // console.log(userInfo);
      const query = { email: userInfo.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: `user already exist` });
      }

      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`fitnes tracker server is working!!`);
});

app.listen(port, () => {
  console.log(`fitnes tracker is working on port ${port}`);
});
