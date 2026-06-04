// Star Wars Trivia Questions Database
const QUESTIONS = [
  {
    id: 1,
    category: "Movie Order",
    question: "Which film is #1 in chronological order?",
    options: ["The Phantom Menace", "A New Hope", "Attack of the Clones", "Revenge of the Sith"],
    correctAnswer: 0
  },
  {
    id: 2,
    category: "Movie Order",
    question: "Which Star Wars film was released first in theaters?",
    options: ["The Phantom Menace", "The Empire Strikes Back", "A New Hope", "Return of the Jedi"],
    correctAnswer: 2
  },
  {
    id: 3,
    category: "Movie Order",
    question: "What is the chronological position of 'Return of the Jedi'?",
    options: ["4th", "5th", "7th", "6th"],
    correctAnswer: 3
  },
  {
    id: 4,
    category: "Movie Order",
    question: "Which film comes immediately before 'The Force Awakens' in chronological order?",
    options: ["Return of the Jedi", "The Last Jedi", "Revenge of the Sith", "A New Hope"],
    correctAnswer: 0
  },
  {
    id: 5,
    category: "Movie Order",
    question: "In release order, which film was released 4th?",
    options: ["A New Hope", "Return of the Jedi", "The Phantom Menace", "Attack of the Clones"],
    correctAnswer: 2
  },
  {
    id: 6,
    category: "Starships",
    question: "Which starship has a hyperdrive rating of 0.5 (the fastest)?",
    options: ["X-wing", "Millennium Falcon", "Jedi Interceptor", "A-wing"],
    correctAnswer: 1
  },
  {
    id: 7,
    category: "Starships",
    question: "What is the length of the Death Star in meters?",
    options: ["1,600 m", "19,000 m", "120,000 m", "3,170 m"],
    correctAnswer: 2
  },
  {
    id: 8,
    category: "Starships",
    question: "Which starship has the highest atmospheric speed in the dataset (1,500 km/h)?",
    options: ["A-wing", "TIE Advanced x1", "Jedi Interceptor", "Naboo fighter"],
    correctAnswer: 2
  },
  {
    id: 9,
    category: "Species",
    question: "Which species has an average lifespan of 1,000 years?",
    options: ["Wookie", "Yoda's species", "Human", "Hutt"],
    correctAnswer: 3
  },
  {
    id: 10,
    category: "Species",
    question: "What language do Wookies speak?",
    options: ["Huttese", "Shyriiwook", "Galactic Basic", "Ewokese"],
    correctAnswer: 1
  }
];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // API endpoint: GET /api/questions
    if (url.pathname === "/api/questions" && request.method === "GET") {
      const shuffled = QUESTIONS.sort(() => Math.random() - 0.5);
      return new Response(JSON.stringify(shuffled), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // API endpoint: POST /api/check-answer
    if (url.pathname === "/api/check-answer" && request.method === "POST") {
      const { questionId, selectedIndex } = await request.json();
      const question = QUESTIONS.find(q => q.id === questionId);
      
      if (!question) {
        return new Response(JSON.stringify({ error: "Question not found" }), { status: 404 });
      }

      const isCorrect = selectedIndex === question.correctAnswer;
      return new Response(JSON.stringify({
        isCorrect,
        correctAnswer: question.options[question.correctAnswer],
        explanation: `The correct answer is: ${question.options[question.correctAnswer]}`
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Serve HTML for all other routes
    return new Response(getHTML(), {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};

function getHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Star Wars Trivia</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            font-family: 'Arial', sans-serif;
            color: #fff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: rgba(26, 26, 46, 0.95);
            border: 3px solid #ffd700;
            border-radius: 10px;
            padding: 40px;
            max-width: 700px;
            width: 100%;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
        }

        .header h1 {
            color: #ffd700;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            margin-bottom: 10px;
        }

        .header p {
            color: #bbb;
            font-size: 0.9em;
        }

        .quiz-section {
            display: none;
        }

        .quiz-section.active {
            display: block;
        }

        .progress {
            background: #0f3460;
            height: 8px;
            border-radius: 4px;
            margin-bottom: 30px;
            overflow: hidden;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #ffd700, #ffed4e);
            width: 0%;
            transition: width 0.3s ease;
        }

        .question-num {
            color: #ffd700;
            font-size: 0.9em;
            margin-bottom: 10px;
        }

        .category {
            display: inline-block;
            background: #3a3a5a;
            color: #ffd700;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            margin-bottom: 15px;
        }

        .question {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 25px;
            line-height: 1.4;
        }

        .options {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .option {
            background: #2a2a4e;
            border: 2px solid #444;
            padding: 15px 20px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 1em;
            color: #fff;
            text-align: left;
        }

        .option:hover {
            background: #3a3a5e;
            border-color: #ffd700;
        }

        .option.correct {
            background: #1a3a1a;
            border-color: #00ff00;
            color: #00ff00;
        }

        .option.incorrect {
            background: #3a1a1a;
            border-color: #ff0000;
            color: #ff6666;
        }

        .option:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }

        .feedback {
            margin-top: 20px;
            padding: 15px;
            border-radius: 6px;
            display: none;
        }

        .feedback.show {
            display: block;
        }

        .feedback.correct {
            background: rgba(0, 255, 0, 0.1);
            border-left: 4px solid #00ff00;
            color: #00ff00;
        }

        .feedback.incorrect {
            background: rgba(255, 0, 0, 0.1);
            border-left: 4px solid #ff0000;
            color: #ff6666;
        }

        .button-group {
            display: flex;
            gap: 10px;
            margin-top: 30px;
        }

        button {
            flex: 1;
            padding: 12px 20px;
            font-size: 1em;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
        }

        .btn-next {
            background: #ffd700;
            color: #1a1a2e;
            display: none;
        }

        .btn-next.show {
            display: block;
        }

        .btn-next:hover {
            background: #ffed4e;
            transform: translateY(-2px);
        }

        .btn-restart {
            background: #0f7938;
            color: #fff;
            display: none;
        }

        .btn-restart.show {
            display: block;
        }

        .btn-restart:hover {
            background: #10a042;
        }

        .results {
            text-align: center;
        }

        .results h2 {
            color: #ffd700;
            font-size: 2em;
            margin-bottom: 20px;
        }

        .score {
            font-size: 3em;
            color: #ffd700;
            margin: 30px 0;
            font-weight: bold;
        }

        .score-text {
            color: #bbb;
            font-size: 1.1em;
            margin-bottom: 30px;
        }

        .start-button {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #1a1a2e;
            padding: 15px 40px;
            font-size: 1.1em;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .start-button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⭐ Star Wars Trivia</h1>
            <p>Test your knowledge of the galaxy far, far away</p>
        </div>

        <!-- Start Screen -->
        <div id="startScreen" class="quiz-section active">
            <div style="text-align: center; padding: 40px 0;">
                <p style="font-size: 1.2em; margin-bottom: 30px;">Ready to become a Jedi Master of Star Wars knowledge?</p>
                <button class="start-button" onclick="startQuiz()">Start Quiz</button>
            </div>
        </div>

        <!-- Quiz Screen -->
        <div id="quizScreen" class="quiz-section">
            <div class="progress">
                <div class="progress-bar" id="progressBar"></div>
            </div>

            <div class="question-num">Question <span id="currentQuestion">1</span> of <span id="totalQuestions">10</span></div>
            <span class="category" id="category"></span>

            <div class="question" id="question"></div>

            <div class="options" id="options"></div>

            <div class="feedback" id="feedback"></div>

            <div class="button-group">
                <button class="btn-next" id="btnNext" onclick="nextQuestion()">Next Question</button>
            </div>
        </div>

        <!-- Results Screen -->
        <div id="resultsScreen" class="quiz-section">
            <div class="results">
                <h2>Quiz Complete!</h2>
                <div class="score" id="finalScore">0/10</div>
                <div class="score-text" id="scoreMessage"></div>
                <button class="btn-restart" onclick="restartQuiz()">Try Again</button>
            </div>
        </div>
    </div>

    <script>
        let questions = [];
        let currentQuestionIndex = 0;
        let score = 0;
        let answered = false;

        async function startQuiz() {
            try {
                const response = await fetch('/api/questions');
                questions = await response.json();
                currentQuestionIndex = 0;
                score = 0;
                answered = false;
                
                showScreen('quizScreen');
                loadQuestion();
            } catch (error) {
                alert('Error loading questions: ' + error.message);
            }
        }

        function loadQuestion() {
            const question = questions[currentQuestionIndex];
            answered = false;

            document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
            document.getElementById('totalQuestions').textContent = questions.length;
            document.getElementById('category').textContent = question.category;
            document.getElementById('question').textContent = question.question;
            document.getElementById('feedback').classList.remove('show', 'correct', 'incorrect');
            document.getElementById('btnNext').classList.remove('show');

            const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
            document.getElementById('progressBar').style.width = progressPercent + '%';

            const optionsContainer = document.getElementById('options');
            optionsContainer.innerHTML = '';

            question.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option';
                button.textContent = option;
                button.onclick = () => selectAnswer(index);
                optionsContainer.appendChild(button);
            });
        }

        async function selectAnswer(index) {
            if (answered) return;
            answered = true;

            const question = questions[currentQuestionIndex];
            const buttons = document.querySelectorAll('.option');
            buttons.forEach(btn => btn.disabled = true);

            try {
                const response = await fetch('/api/check-answer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        questionId: question.id,
                        selectedIndex: index
                    })
                });

                const result = await response.json();

                buttons[index].classList.add(result.isCorrect ? 'correct' : 'incorrect');
                if (!result.isCorrect) {
                    const correctIndex = question.correctAnswer;
                    buttons[correctIndex].classList.add('correct');
                }

                if (result.isCorrect) {
                    score++;
                }

                const feedback = document.getElementById('feedback');
                feedback.textContent = result.explanation;
                feedback.classList.add('show', result.isCorrect ? 'correct' : 'incorrect');
                document.getElementById('btnNext').classList.add('show');

            } catch (error) {
                alert('Error checking answer: ' + error.message);
            }
        }

        function nextQuestion() {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }

        function showResults() {
            const percentage = (score / questions.length) * 100;
            document.getElementById('finalScore').textContent = score + '/' + questions.length;
            
            let message = '';
            if (percentage === 100) {
                message = "Perfect! You're a true Jedi Master! 🌟";
            } else if (percentage >= 80) {
                message = "Excellent! You have strong Star Wars knowledge! 🎬";
            } else if (percentage >= 60) {
                message = "Good effort! Keep studying the saga! 📚";
            } else {
                message = "May the Force be with you! Try again! ⚡";
            }
            
            document.getElementById('scoreMessage').textContent = message;
            showScreen('resultsScreen');
        }

        function restartQuiz() {
            showScreen('startScreen');
        }

        function showScreen(screenId) {
            document.querySelectorAll('.quiz-section').forEach(el => el.classList.remove('active'));
            document.getElementById(screenId).classList.add('active');
        }
    </script>
</body>
</html>
  `;
}
