// Worked. Managed to integrate py with nodejs environment.
//Trying to integrate textblob review-to-rating

const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 4504;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
                                               
// ✅ Serve the page with the form (GET request)
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automated Review Rating</title>
  </head>
  <body>

    <h1>Provide Feedback and Generate Automated Rating</h1>
    <form id="reviewForm">
      <textarea id="reviewInput" name="review" placeholder="Enter a review" required rows="2" style="width: 50%; resize: none; overflow-y: auto;"></textarea>
      <script>
        const textarea = document.getElementById("reviewInput");
        textarea.addEventListener("input", function () {
          this.style.height = "auto"; // Reset height to recalculate
          this.style.height = Math.min(this.scrollHeight, 400) + "px"; // Expand but limit max height
        });
      </script>

      <br><br>
      <button type="submit">Get Rating</button>
    </form>
    
    <div id="result"></div>
    <button id="submitAnother" style="display: none;" onclick="restart()">Submit Another Review</button>

    <script>
      document.getElementById("reviewForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent form from refreshing the page

        const reviewText = document.getElementById("reviewInput").value.trim(); // Trim extra spaces

        if (!reviewText) return; // Prevent empty submission

        document.getElementById("reviewForm").querySelector("button[type='submit']").disabled = true; // Disable button to prevent double submission

        fetch("/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "review=" + encodeURIComponent(reviewText)
        })
        .then(response => response.text())
        .then(data => {
          document.getElementById("result").innerHTML = data; // Display result dynamically
          document.getElementById("submitAnother").style.display = "block"; // Show submit another button
          document.getElementById("reviewForm").querySelector("button[type='submit']").disabled = false; // Re-enable button after response
        })
        .catch(error => {
          console.error("Error:", error);
          document.getElementById("reviewForm").querySelector("button[type='submit']").disabled = false; // Re-enable button in case of error
        });
      });

      function restart() {
        document.getElementById("result").innerHTML = ""; // ✅ Clear rating result
        document.getElementById("reviewInput").value = ""; // ✅ Reset input field
        document.getElementById("reviewInput").style.height = "auto"; // ✅ Reset textarea height
        document.getElementById("submitAnother").style.display = "none"; // ✅ Hide button
      }
    </script>

  </body>
  </html>`);
});

// ✅ Handle form submission and return only the rating result (POST request)
app.post("/", (req, res) => {
    let userReview = req.body.review;
    if (!userReview) {
      return res.send(`<p>Error: No review provided.</p>`);
    }
    // Escape double quotes to prevent issues with shell execution
    userReview = userReview.replace(/"/g, '\\"');
  
    exec(`python feature.py "${userReview}"`, (error, stdout, stderr) => {
      if (error) {
        return res.send(`<p>Error: ${stderr}</p>`);
      }

      const lines = stdout.trim().split("\n");
      const polarityLine = lines[0]; // Contains the polarity score
      const rating = lines[1];       // Contains just the rating number
      
      res.send(`
        <hr>
        <h2>Rating Console:</h2>
        <h3>Review: "${userReview}"</h3>
        <h3>Assigned Rating: ${rating} / 5</h3>
        <h3>Polarity Score (0~2): ${polarityLine}</h3>
      `);
    });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});