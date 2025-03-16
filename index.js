// const express = require('express');
// const { exec } = require('child_process');
// const path = require('path');

// const app = express();
// const port = 4500;

// app.use(express.json());

// Serve the HTML file for the homepage
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

// app.post('/run-python', (req, res) => {
//   const userInput = req.body.userInput || 'Default';
//   exec(`python feature.py "${userInput}"`, (error, stdout) => {
//     if (error) {
//       console.error(`Error executing script: ${error.message}`);
//       return res.json({ error: 'Script execution failed' });
//     }
//     res.json({ result: stdout.trim() });
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
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
      const rating = stdout.trim();
      res.send(`
        <h3>Review: "${userReview}"</h3>
        <h3>Assigned Rating: ${rating} / 5</h3>
      `);
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});