const itemsListEl = document.getElementById("items-list");
const totalEl = document.getElementById("total");

const items = new Array(15).fill(0).map((_, index) => ({
  product_name: `Item ${index + 1}`,
  price: parseFloat((Math.random() * 100).toFixed(2)),
  currency: {
    label: "usd",
    icon: "$",
  },
  id: index + 1,
}));

const cart = {};

displayItems(items);

function displayItems(items) {
  const frag = new DocumentFragment();
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = displayItemContent(item);

    li.onclick = () => selectItem(item);

    frag.appendChild(li);
  });

  itemsListEl.appendChild(frag);
}

function displayItemContent(item) {
  return `
        <div class="flex items-center gap-3">
            <p>
                ${item.product_name}
            </p>
            <span>
                |
            </span>
            <p>
                ${item.price} ${item.currency.icon}
            </p>
        </div>
        ${
          item.id in cart
            ? `<span class="text-sm" >x ${cart[item.id].count}<span>`
            : ""
        }
        `;
}

function selectItem(item) {
  const { price } = item;
  const { count = 0 } = cart[item.id] || {};
  cart[item.id] = {
    count: count + 1,
    totalPrice: (count + 1) * price,
  };
  const li = document.querySelector(`li:nth-child(${item.id})`);
  li.innerHTML = displayItemContent(item);
  updateTotal();
}

function updateTotal() {
  const value = Object.values(cart).reduce(
    (acc, item) => Math.floor((acc + item.totalPrice) * 100) / 100,
    0
  );
  totalEl.innerHTML = `Total : ${value} $`;
}
