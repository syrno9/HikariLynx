	const fieldMessage = document.getElementById("fieldMessage");
	const emoteButtons = document.querySelectorAll(
	  "#fieldMessage ~ details > p:not(:first-of-type)"
	);

	for (const row of emoteButtons) {
	  for (const emoteButton of row.children) {
		const emoteText = emoteButton.children[1].innerText;

		emoteButton.addEventListener("click", () => {
		  fieldMessage.value += emoteText;
		});
	  }
	}