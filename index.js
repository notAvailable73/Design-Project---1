// Worked. Managed to integrate py with nodejs environment.
//Trying to integrate textblob review-to-rating

const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 4500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send(`
      <form action="/run-python" method="post">
        <input type="text" name="review" placeholder="Enter a review">
        <button type="submit">Get Rating</button>
      </form>
    `);
});

app.post("/run-python", (req, res) => {
    const userReview = req.body.review;
  
    exec(`python feature.py "${userReview}"`, (error, stdout, stderr) => {
      if (error) {
        return res.send(`<p>Error: ${stderr}</p>`);
      }
      // const rating = stdout.trim();
      // Split the stdout by lines and extract information
      const lines = stdout.trim().split('\n');
      const polarityLine = lines[0]; // Contains the polarity score
      const rating = lines[1];       // Contains just the rating number
      res.send(`
        <h3>Review: "${userReview}"</h3>
        <h3>Assigned Rating: ${rating} / 5</h3>
        <h3>Polarity Score (0~2): ${polarityLine}</h3>
      `);
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});