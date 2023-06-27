const itemsListEl = document.getElementById("items-list");
const totalEl = document.getElementById("total");
const checkOutBtn = document.getElementById("check-out");

const items = new Array(20).fill(0).map((_, index) => ({
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

    frag.appendChild(li);
  });

  itemsListEl.appendChild(frag);
}

function displayItemContent(item) {
  const productItem = encodeURIComponent(JSON.stringify(item));
  const isDisabled = item.id in cart ? cart[item.id].count === 0 : true;
  return `
        <div class="flex flex-1 items-center gap-3 border border-gray-200 rounded-md p-4 duration-100 
        hover:bg-gray-100 [user-select:none]">
            <p class="text-sm sm:text-base" >
                ${item.product_name}
            </p>
            <span class="text-sm sm:text-base" >
                |
            </span>
            <p class="text-sm sm:text-base" >
                ${item.price} ${item.currency.icon}
            </p>
        </div>
        <div class="actions flex items-center gap-2" >
          <button class="rounded-md h-6 w-6 sm:h-8 sm:w-8 inline-flex items-center justify-center cursor-pointer 
            border border-green-800 bg-transparent hover:bg-gray-100 duration-200 text-black text-sm sm:text-lg active:scale-95"
            onclick="selectItem('${productItem}', 'incr')"
          > 
            + 
          </button>
          <span>${cart[item.id]?.count ?? 0}</span>
          <button 
            class="rounded-md h-6 w-6 sm:h-8 sm:w-8 inline-flex items-center justify-center cursor-pointer
              border border-red-800 bg-transparent hover:bg-gray-100 duration-200 text-black text-sm sm:text-lg active:scale-95
              disabled:cursor-not-allowed disabled:opacity-50
            "
            ${isDisabled ? "disabled" : ""}
            onclick="selectItem('${productItem}', 'reduce')"
          > 
            - 
          </button>
        </div>
        `;
}

function calcPrice(item, count) {
  return Math.floor(item.price * count * 100);
}

function reduce(item, count) {
  if (count === 0) return null;

  count--;

  return {
    totalPrice: calcPrice(item, count),
    count,
    item,
  };
}

function incr(item, count) {
  count++;
  return {
    totalPrice: calcPrice(item, count),
    count,
    item,
  };
}

const actions = {
  incr,
  reduce,
};

function selectItem(item, action) {
  item = JSON.parse(decodeURIComponent(item));
  const count = cart[item.id]?.count || 0;
  const operation = actions[action];
  const value = operation(item, count);
  if (value == null) return;
  cart[item.id] = value;

  if (value.count === 0) delete cart[item.id];

  const li = document.querySelector(`li:nth-child(${item.id})`);
  li.innerHTML = displayItemContent(item);
  totalEl.innerHTML = updateTotal();
  updateCheckOutBtn();
}

function updateTotal() {
  const value = Object.values(cart).reduce(
    (acc, item) => acc + item.totalPrice,
    0
  );
  return "Total : " + value / 100 + " $";
}

function updateCheckOutBtn() {
  const isDisabled = Object.values(cart).length <= 0;
  if (isDisabled) return checkOutBtn.setAttribute("disabled", true);
  return checkOutBtn.removeAttribute("disabled");
}
