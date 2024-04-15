const quotes = [
    '"Okaerinasai!"',
    '"Three times the comfy!"',
    '"Love palace~"',
    '"Take it easy!"',
    '"syrno is a lazy fuck"',
    '"I am go to bed, goodnight~"',
    '"Kiss your imouto!"'
];

function displayRandomQuote() {
    const quoteElement = document.getElementById('quote');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = quotes[randomIndex];
}

// Initial quote display
displayRandomQuote();

// Change quote on click
const quoteElement = document.getElementById('quote');
quoteElement.addEventListener('click', displayRandomQuote);