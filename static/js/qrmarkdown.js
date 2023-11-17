const fieldMessage = document.getElementById("qrbody");
const emoteButtons = document.querySelectorAll(
  "#qrFilesBody details p:not(:first-of-type) button"
);

for (const emoteButton of emoteButtons) {
  emoteButton.addEventListener("click", () => {
    const emoteText = emoteButton.querySelector("p").innerText;
    fieldMessage.value += emoteText;
  });
}
