const modal = document.getElementById("modal");
const modalContent = modal.querySelector("& > div");
const checkOutBtn = document.getElementById("check-out");

checkOutBtn.addEventListener("click", () => {
  modal.classList.toggle("open");
});

modal.addEventListener("click", (e) => {
  if (e.target.matches("#modal > div")) return;
  if (e.target.matches("#modal > div *")) return;
  modal.classList.toggle("open", false);
});
