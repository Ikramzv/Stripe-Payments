import { config as env } from "dotenv";
import express from "express";
import path from "path";
import Stripe from "stripe";
import { Cart } from "types";

env();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SK as string, {
  apiVersion: "2022-11-15",
});

app.use(express.static(path.join(process.cwd(), "public")));
app.use("/create-checkout", express.json());

const calcAmount = (cart: Cart) =>
  Object.values(cart).reduce((acc, item) => acc + item.totalPrice, 0);

app.post("/create-checkout", async (req, res) => {
  const { cart } = req.body;
  const customer = await stripe.customers.create();
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.id,
    setup_future_usage: "off_session", // Tells Stripe how you plan to use the payment method
    amount: calcAmount(cart),
    currency: "usd",
    automatic_payment_methods: {
      // Enables cards and other payment methods for us
      enabled: true,
    },
  });

  return res.status(201).json(paymentIntent);
});

app.get("/", (req, res) => {
  // const {  } = req.query
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

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const sec = process.env.STRIPE_WEBHOOK_SK as string;
  let event = req.body;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, sec);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }

  res.status(200).send();
});

app.listen(3000, () => {
  console.log("App is running");
});
