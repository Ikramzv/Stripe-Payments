import { config as env } from "dotenv";
import express from "express";
import path from "path";
import Stripe from "stripe";

env();

const app = express();
const stripe = Stripe()(process.env.STRIPE_PK);

app.use(express.static(path.resolve(process.cwd(), "public")));
app.use(express.json());

const calcAmount = (items) => items.reduce((acc, item) => acc + item.price, 0);

app.post("/create-check-out", async (req, res) => {
  const { items } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calcAmount(items),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  console.log(paymentIntent);

  res.status(201).json(paymentIntent);
});

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.listen(3000, () => {
  console.log("App is running");
});
