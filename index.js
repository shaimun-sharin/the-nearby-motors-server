const express = require("express");
const cors = require("cors");
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
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("nearby-motors").collection("products");
    const orderCollection = client.db("nearby-motors").collection("orders");

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
    app.get("/order", async (req, res) => {
      const client = req.query.client;
      const query = { client: client };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
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
