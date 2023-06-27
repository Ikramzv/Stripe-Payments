import { config as env } from "dotenv";
import express from "express";
import path from "path";
import Stripe from "stripe";

env();

const app = express();
const stripe = Stripe(process.env.STRIPE_SK);

app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());

const calcAmount = (cart) =>
  Object.values(cart).reduce((acc, item) => acc + item.totalPrice, 0);

app.post("/create-checkout", async (req, res) => {
  const { cart } = req.body;
  console.log(cart);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calcAmount(cart),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.status(201).json(paymentIntent);
});

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/error", (req, res) => {
  return res.sendFile(
    path.resolve(process.cwd(), "public", "pages", "error.html")
  );
});

app.get("/success", async (req, res) => {
  const { payment_intent_client_secret } = req.query;
  const url = path.resolve(process.cwd(), "public", "pages");
  if (payment_intent_client_secret == null)
    return res.redirect(`/error?reason=No Payment Intent provided`);

  res.sendFile(url + "/success.html");
});

app.get("/invalid_payment_intent", async (req, res) => {
  return res.sendFile(
    path.resolve(
      process.cwd(),
      "public",
      "pages",
      "invalid_payment_intent.html"
    )
  );
});

app.listen(3000, () => {
  console.log("App is running");
});
