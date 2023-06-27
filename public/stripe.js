const modal = document.getElementById("modal");
const modalContent = modal.querySelector("& > div");
const paymentMessageEl = document.getElementById("payment-message");
const spinner = document.getElementById("spinner");

let ctrl = new AbortController();

const setAbortCtrl = (newCtrl) => (ctrl = newCtrl);

checkOutBtn.addEventListener("click", async () => {
  if (Object.values(cart).length <= 0) return;
  modal.classList.toggle("open");
  setModalLoading(true);
  await createPaymentIntent();
  setModalLoading(false);
});

function setModalLoading(isLoading) {
  modal.classList.toggle("loading", isLoading);
}

function setPaymentButtonLoading(isLoading) {
  if (isLoading) checkOutBtn.setAttribute("disabled", true);
  else checkOutBtn.removeAttribute("disabled");
  spinner.classList.toggle("hidden", !isLoading);
}

function showErrMessage(message) {
  paymentMessageEl.classList.remove("hidden");
  paymentMessageEl.textContent = message;
}

function deleteErrMessage() {
  paymentMessageEl.classList.add("hidden");
  paymentMessageEl.textContent = "";
}

modal.addEventListener("click", (e) => {
  if (e.target.matches("#modal > div")) return;
  if (e.target.matches("#modal > div *")) return;
  modal.classList.toggle("open", false);
  ctrl.abort();
  reset();
});

function reset() {
  setElements(null);
  setAbortCtrl(new AbortController());
  setEmailAdress("");
  setPaymentButtonLoading(false);
  deleteErrMessage();
}

/**
 * STRIPE
 */

const stripe = Stripe(
  "pk_test_51LKRZpKdVwb3mKDKsjvPxL8YDpI3R48Xtbu5mWjb5iL6JMTBUVRW72DDwzLmSjzUByvNfdrZ20Ot1gGzDZVyZkhi00iCdhP3r6"
);

const paymentFormEl = document.getElementById("payment-form");

paymentFormEl.addEventListener("submit", handleSubmit);

let emailAddress = "";
let elements;

function setElements(value) {
  elements = value;
}

function setEmailAdress(value) {
  emailAddress = value;
}

async function handleSubmit(e) {
  e.preventDefault();
  setPaymentButtonLoading(true);
  const res = await stripe.confirmPayment({
    elements,
    confirmParams: {
      receipt_email: emailAddress,
      return_url: "http://localhost:3000/success",
    },
  });
  console.log(res);
  const { error } = res;

  if (error.type === "card_error" || error.type === "validation_error") {
    showErrMessage(error.message);
  } else {
    showErrMessage("An unexpected error occurred.");
  }

  setPaymentButtonLoading(false);
}

async function createPaymentIntent() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");

  if (Object.keys(cart).length <= 0) return;
  const res = await fetch("http://localhost:3000/create-checkout", {
    method: "POST",
    body: JSON.stringify({ cart }),
    headers,
    signal: ctrl.signal,
  });
  const paymentIntent = await res.json();
  const { client_secret: clientSecret } = paymentIntent;
  const appearance = { theme: "stripe" };

  setElements(stripe.elements({ appearance, clientSecret }));
  createLinkAuthenticationElement();
  createPaymentElement();
}

function createLinkAuthenticationElement() {
  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");
  linkAuthenticationElement.on("change", (e) => {
    deleteErrMessage();
    setEmailAdress(e.value.email);
  });
}

function createPaymentElement() {
  const paymentElementOptions = { layout: "tabs" };
  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
}
