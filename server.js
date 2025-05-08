const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS to allow requests from Netlify frontend
app.use(cors({
  origin: ['https://chatbot-altibbe.netlify.app', 'http://localhost:5173']
}));
app.use(express.json());

// Ensure answers.json exists
const ensureAnswersFile = async () => {
  try {
    await fs.access(path.join(__dirname, 'answers.json'));
  } catch {
    await fs.writeFile(path.join(__dirname, 'answers.json'), '[]');
  }
};
ensureAnswersFile();

// Get questions
app.get('/questions', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'questions.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading questions:', err);
    res.status(500).json({ error: 'Failed to read questions' });
  }
});

// Get all answers
app.get('/answers', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'answers.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error fetching answers:', err);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

// Post new answer
app.post('/answers', async (req, res) => {
  try {
    const newAnswer = req.body;
    const data = await fs.readFile(path.join(__dirname, 'answers.json'), 'utf8');
    const answers = JSON.parse(data);
    
    // Remove existing answer with same questionId
    const filteredAnswers = answers.filter(a => a.questionId !== newAnswer.questionId);
    filteredAnswers.push(newAnswer);
    
    await fs.writeFile(path.join(__dirname, 'answers.json'), JSON.stringify(filteredAnswers, null, 2));
    res.status(201).json(newAnswer);
  } catch (err) {
    console.error('Error saving answer:', err);
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// Update existing answer
app.put('/answers/:questionId', async (req, res) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const updatedAnswer = req.body;
    const data = await fs.readFile(path.join(__dirname, 'answers.json'), 'utf8');
    let answers = JSON.parse(data);
    
    // Find and update the answer
    const index = answers.findIndex(a => a.questionId === questionId);
    if (index !== -1) {
      answers[index] = updatedAnswer;
    } else {
      answers.push(updatedAnswer);
    }
    
    await fs.writeFile(path.join(__dirname, 'answers.json'), JSON.stringify(answers, null, 2));
    res.json(updatedAnswer);
  } catch (err) {
    console.error('Error updating answer:', err);
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});