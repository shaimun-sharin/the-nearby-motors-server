const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("The NearBy Motors is running!");
});

app.listen(port, () => {
  console.log(`Nearby Motors listening on port ${port}`);
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@thenearbymotors.bwksm45.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("nearby-motors").collection("products");
    const orderCollection = client.db("nearby-motors").collection("orders");
    const userCollection = client.db("nearby-motors").collection("users");
    const verifyAdmin = async (req, res, next) => {
      const initiator = req.decoded.email;
      const initiatorAcc = await userCollection.findOne({ email: initiator });
      if (initiatorAcc.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    };

    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    app.post("/order", async (req, res) => {
      console.log(req.body);
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      console.log(result);
      res.send(result);
    });
    app.get("/order", verifyJWT, async (req, res) => {
      const client = req.query.client;
      const decodedEmail = req.decoded.email;
      if (client === decodedEmail) {
        const query = { client: client };
        const orders = await orderCollection.find(query).toArray();
        res.send(orders);
      } else {
        return res.status(403).send({ message: "Forbidden access" });
      }
    });
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });
    app.get("/user", verifyJWT, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });
    app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;

      const filter = { email: email };

      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });
    // app.put("/product/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const newQuantity = parseInt(req.body);
    //   console.log(newQuantity);
    //   const filter = { _id: ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedDoc = {
    //     $set: {
    //       availableQuantity: newQuantity.quantity,
    //     },
    //   };
    //   const result = await productCollection.updateOne(
    //     filter,
    //     updatedDoc,
    //     options
    //   );
    //   res.send(result);
    // });
  } finally {
  }
}
run().catch(console.dir);
