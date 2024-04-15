        document.addEventListener("DOMContentLoaded", function () {
            // Check if the URL includes "/i/"
            if (window.location.href.includes("/i/")) {
                // Create a new style element
                var style = document.createElement("style");
                style.type = "text/css";
                // Set the CSS rule
                style.innerHTML = ".BBSNeo { display: block; }";
                // Append the style element to the document
                document.head.appendChild(style);
            }
        });