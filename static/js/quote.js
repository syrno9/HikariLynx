const quotes = [
    '"Okaerinasai!"',
    '"Three times the comfy!"',
    '"Love palace~"',
    '"Take it easy!"'
];

function displayRandomQuote() {
    const quoteElement = document.getElementById('quote');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = quotes[randomIndex];
}
displayRandomQuote();