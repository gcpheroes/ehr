// script.js

// ─── Question Bank ─────────────────────────────────────────────────────────
const questions = [
  {
    "question": "For this question, refer to the EHR Healthcare case study. You are responsible for ensuring that EHR's use of Google Cloud will pass an upcoming privacy compliance audit. What should you do? (Choose two.)",
    "options": [
      "Verify EHR's product usage against the list of compliant products on the Google Cloud compliance page.",
      "Advise EHR to execute a Business Associate Agreement (BAA) with Google Cloud.",
      "Use Firebase Authentication for EHR's user facing applications.",
      "Implement Prometheus to detect and prevent security breaches on EHR's web-based applications.",
      "Use GKE private clusters for all Kubernetes workloads."
    ],
    "answer": [
      "Verify EHR's product usage against the list of compliant products on the Google Cloud compliance page.",
      "Advise EHR to execute a Business Associate Agreement (BAA) with Google Cloud."
    ],
    "multiple": true
  },
  {
    "question": "For this question, refer to the EHR Healthcare case study. You need to define the technical architecture for securely deploying workloads to Google Cloud. You also need to ensure that only verified containers are deployed using Google Cloud services. What should you do? (Choose two.)",
    "options": [
      "Enable Binary Authorization on GKE, and sign containers as part of a CI/CD pipeline.",
      "Configure Jenkins to utilize Kritis to cryptographically sign a container as part of a CI/CD pipeline.",
      "Configure Container Registry to only allow trusted service accounts to create and deploy containers from the registry.",
      "Configure Container Registry to use vulnerability scanning to confirm that there are no vulnerabilities before deploying the workload."
    ],
    "answer": [
      "Enable Binary Authorization on GKE, and sign containers as part of a CI/CD pipeline.",
      "Configure Container Registry to use vulnerability scanning to confirm that there are no vulnerabilities before deploying the workload."
    ],
    "multiple": true
  },
  {
    "question": "You need to upgrade the EHR connection to comply with their requirements. The new connection design must support business-critical needs and meet the same network and security policy requirements. What should you do?",
    "options": [
      "Add a new Dedicated Interconnect connection.",
      "Upgrade the bandwidth on the Dedicated Interconnect connection to 100 G.",
      "Add three new Cloud VPN connections.",
      "Add a new Carrier Peering connection."
    ],
    "answer": [
      "Add a new Dedicated Interconnect connection."
    ],
    "multiple": false
  },
  {
    "question": "For this question, refer to the EHR Healthcare case study. You need to define the technical architecture for hybrid connectivity between EHR's on-premises systems and Google Cloud. You want to follow Google's recommended practices for production-level applications. Considering the EHR Healthcare business and technical requirements, what should you do?",
    "options": [
      "Configure two Partner Interconnect connections in one metro (City), and make sure the Interconnect connections are placed in different metro zones.",
      "Configure two VPN connections from on-premises to Google Cloud, and make sure the VPN devices on-premises are in separate racks.",
      "Configure Direct Peering between EHR Healthcare and Google Cloud, and make sure you are peering at least two Google locations.",
      "Configure two Dedicated Interconnect connections in one metro (City) and two connections in another metro, and make sure the Interconnect connections are placed in different metro zones."
    ],
    "answer": [
      "Configure two Dedicated Interconnect connections in one metro (City) and two connections in another metro, and make sure the Interconnect connections are placed in different metro zones."
    ],
    "multiple": false
  },
  {
    "question": "For this question, refer to the EHR Healthcare case study. You are a developer on the EHR customer portal team. Your team recently migrated the customer portal application to Google Cloud. The load has increased on the application servers, and now the application is logging many timeout errors. You recently incorporated Pub/Sub into the application architecture, and the application is not logging any Pub/Sub publishing errors. You want to improve publishing latency. What should you do?",
    "options": [
      "Increase the Pub/Sub Total Timeout retry value.",
      "Move from a Pub/Sub subscriber pull model to a push model.",
      "Turn off Pub/Sub message batching.",
      "Create a backup Pub/Sub message queue."
    ],
    "answer": [
      "Turn off Pub/Sub message batching."
    ],
    "multiple": false
  },
  {
    "question": "For this question, refer to the EHR Healthcare case study. In the past, configuration errors put public IP addresses on backend servers that should not have been accessible from the Internet. You need to ensure that no one can put external IP addresses on backend Compute Engine instances and that external IP addresses can only be configured on frontend Compute Engine instances. What should you do?",
    "options": [
      "Create an Organizational Policy with a constraint to allow external IP addresses only on the frontend Compute Engine instances.",
      "Revoke the compute.networkAdmin role from all users in the project with front end instances.",
      "Create an Identity and Access Management (IAM) policy that maps the IT staff to the compute.networkAdmin role for the organization.",
      "Create a custom Identity and Access Management (IAM) role named GCE_FRONTEND with the compute.addresses.create permission."
    ],
    "answer": [
      "Create an Organizational Policy with a constraint to allow external IP addresses only on the frontend Compute Engine instances."
    ],
    "multiple": false
  },
  {
    "question": "For this question, refer to the EHR Healthcare case study. You are responsible for designing the Google Cloud network architecture for Google Kubernetes\nEngine. You want to follow Google best practices. Considering the EHR Healthcare business and technical requirements, what should you do to reduce the attack surface?",
    "options": [
      "Use a private cluster with a private endpoint with master authorized networks configured.",
      "Use a public cluster with firewall rules and Virtual Private Cloud (VPC) routes.",
      "Use a private cluster with a public endpoint with master authorized networks configured.",
      "Use a public cluster with master authorized networks enabled and firewall rules."
    ],
    "answer": [
      "Use a private cluster with a private endpoint with master authorized networks configured."
    ],
    "multiple": false
  },
];

questions.sort(() => Math.random() - 0.5);

// ─── State & DOM References ───────────────────────────────────────────────────
let currentQuestion   = 0;
let score             = 0;
let showingFeedback   = false;
let quizStartTime     = new Date();
let totalTimeSeconds  = 90 * 60;
let countdownInterval = null;
let userAnswers = [];

const questionEl = document.getElementById("question");
const optionsEl  = document.getElementById("options");
const nextBtn    = document.getElementById("nextBtn");
const finishBtn  = document.getElementById("finishTestBtn");
const resultEl   = document.getElementById("result");
const timerEl    = document.getElementById("timer");

// ─── Utility Functions ───────────────────────────────────────────────────────
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function normalize(str) {
  return str
    .replace(/\\/g, "")     // remove all backslashes
    .replace(/\s+/g, " ")   // collapse whitespace/newlines into single spaces
    .trim();
}

function updateProgress() {
  const pct = (currentQuestion / questions.length) * 100;
  document.getElementById("progressBar").style.width = `${pct}%`;
  document.getElementById("progressText").textContent =
    `Question ${currentQuestion + 1} of ${questions.length}`;
}

// ─── Render Question ─────────────────────────────────────────────────────────
function loadQuestion() {
  showingFeedback    = false;
  resultEl.innerHTML = "";
  nextBtn.textContent = "Submit";

  const q         = questions[currentQuestion];
  const shuffled  = shuffleArray([...q.options]);
  const inputType = q.multiple ? "checkbox" : "radio";

  // break the question into lines, render any image-URL as an <img>
  const html = q.question
    .split('\n')
    .map(line => {
      const m = line.trim().match(/(https?:\/\/\S+\.(?:png|jpe?g|gif|webp))/i);
      if (m) {
        return `<img src="${m[1]}" alt="Question image" style="max-width:100%;height:auto;margin:12px 0;">`;
      }
      // otherwise escape & wrap in a paragraph
      return `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    })
    .join('');
  questionEl.innerHTML = html;
  optionsEl.innerHTML    = "";

  shuffled.forEach(option => {
    const li    = document.createElement('li');
    const label = document.createElement('label');
    label.className = 'option';
  
    const input = document.createElement('input');
    input.type  = inputType;
    input.name  = 'option';
    input.value = option;
  
    const span = document.createElement('span');
    if (option.match(/\.(jpe?g|png|gif|webp)$/i)) {
      const img = document.createElement('img');
      img.src    = option;
      img.alt    = 'Option image';
      img.style.maxWidth = '100%';
      img.style.height   = 'auto';
      span.appendChild(img);
    } else {
      span.textContent = option;
    }
  
    input.addEventListener('change', () => {
      document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
      label.classList.add('selected');
    });
  
    label.append(input, span);
    li.appendChild(label);
    optionsEl.appendChild(li);
  });


  // wire up the “selected” highlight
  optionsEl.querySelectorAll(`input[name="option"]`).forEach(input => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
      input.parentElement.classList.add("selected");
    });
  });

  updateProgress();
  finishBtn.style.display = currentQuestion === questions.length - 1 ? "block" : "none";
}



// ─── Timer ────────────────────────────────────────────────────────────────────
function updateTimerDisplay() {
  const h = Math.floor(totalTimeSeconds / 3600);
  const m = Math.floor((totalTimeSeconds % 3600) / 60);
  const s = totalTimeSeconds % 60;

  let parts = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}m`);
  parts.push(`${s}s`);

  timerEl.textContent = `Time Remaining: ${parts.join(" ")}`;
  totalTimeSeconds--;

  if (totalTimeSeconds < 0) {
    clearInterval(countdownInterval);
    alert("Time's up! Submitting your quiz.");
    showResult();
  }
}

function startTimer() {
  updateTimerDisplay();
  countdownInterval = setInterval(updateTimerDisplay, 1000);
}

// ─── Submission & Feedback ───────────────────────────────────────────────────
nextBtn.addEventListener("click", () => {
  const currentQ       = questions[currentQuestion];
  const selectedInputs = Array.from(
    document.querySelectorAll("input[name='option']:checked")
  );

  if (!showingFeedback) {
    if (selectedInputs.length === 0) {
      alert("Please select at least one option.");
      return;
    }

    // Normalize selected vs. correct
    const selectedNorm = selectedInputs.map(i => normalize(i.value));
    const correctNorm  = currentQ.answer.map(a => normalize(a));

    const isCorrect =
      selectedNorm.length === correctNorm.length &&
      correctNorm.every(ans => selectedNorm.includes(ans));

    const selectedRaw = selectedInputs.map(input => input.value); // preserve original formatting
      userAnswers[currentQuestion] = {
        selected: selectedRaw,
        correct: currentQ.answer,
        question: currentQ.question,
        explanation: currentQ.explanation
      };


    // Disable & highlight in one pass
    optionsEl.querySelectorAll("input[name='option']").forEach(input => {
      input.disabled = true;
      const valNorm = normalize(input.value);
      const lbl     = input.parentElement;

      if (correctNorm.includes(valNorm))       lbl.classList.add("correct");
      else if (input.checked)                  lbl.classList.add("incorrect");
    });

    // Show feedback message
    resultEl.innerHTML = isCorrect
      ? `<p style="color:green;">✅ Correct!</p>`
      : `<p style="color:red;">❌ Incorrect.</p>
         <p>Correct Answer:<br><strong>${currentQ.answer.join("<br>")}</strong></p>`;
    
    
    // ⬇️ Add this below the feedback
    if (currentQ.explanation) {
      resultEl.innerHTML += `<p class="explanation"><strong>Explanation:</strong> ${currentQ.explanation}</p>`;
    }

    
    if (isCorrect) score++;
    showingFeedback     = true;
    nextBtn.textContent = (currentQuestion < questions.length - 1)
      ? "Next Question"
      : "See Result";

  } else {
    // Move to next question or finish
    currentQuestion++;
    if (currentQuestion < questions.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }
});

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m || h) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function saveScoreToHistory(score, total) {
  const endTime = new Date();
  const duration = formatDuration(Math.floor((endTime - quizStartTime) / 1000));

  const record = {
    score,
    total,
    date: endTime.toLocaleString(),
    duration
  };

  let history = JSON.parse(localStorage.getItem("quizScoreHistory")) || [];
  history.push(record);
  localStorage.setItem("quizScoreHistory", JSON.stringify(history));
}

function displayScoreHistory() {
  const container = document.querySelector(".container");
  const historyDiv = document.getElementById("scoreHistory");
  if (historyDiv) historyDiv.remove();

  let history = JSON.parse(localStorage.getItem("quizScoreHistory")) || [];
  if (history.length === 0) return;

  const div = document.createElement("div");
  div.id = "scoreHistory";
  div.style.display = "none";
  div.innerHTML = `
    <h3>Score History</h3>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr><th>#</th><th>Score</th><th>Time Taken</th><th>Date</th></tr>
      </thead>
      <tbody>
        ${history.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.score} / ${r.total}</td>
            <td>${r.duration}</td>
            <td>${r.date}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    
    <div style="margin-top: 10px;">
      <button id="clearHistoryBtn">Clear History</button>
      <button id="restartFromHistoryBtn" style="margin-left: 10px;">Restart Quiz</button>
    </div>
    <hr>
  `;
  container.insertBefore(div, document.getElementById("quiz"));

  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    if (confirm("Clear all score history?")) {
      localStorage.removeItem("quizScoreHistory");
      displayScoreHistory();
    }
  });

  document.getElementById('restartFromHistoryBtn').addEventListener('click', () => {
    if (confirm("Do you want to restart the quiz?")) {
      // Reset quiz state
      score = 0;
      currentQuestion = 0;
      showingFeedback = false;
      quizStartTime = new Date();
  
      // Reset timer
      clearInterval(countdownInterval);
      totalTimeSeconds = 90 * 60; // reset to your default duration
      updateTimerDisplay();
      startTimer();

      // Hide score history section
      const historySection = document.getElementById("scoreHistory");
      if (historySection) historySection.style.display = "none";
  
      // Shuffle and reload quiz
      questions.sort(() => Math.random() - 0.5);
      document.getElementById("quiz").style.display = "block";
      document.getElementById("finalResult").style.display = "none";
      const summary = document.getElementById("summaryPage");
      if (summary) summary.style.display = "none";
  
      loadQuestion();
    }
  });

}


// Helper functions:

function renderAnswerHTML(answers) {
  return answers.map(ans => {
    if (ans.match(/\.(jpe?g|png|gif|webp)$/i)) {
      return `<img src="${ans}" alt="Answer image" style="max-width:100%;height:auto;margin:6px 0;">`;
    }
    return `<p>${ans}</p>`;
  }).join("");
}

function renderQuestionHTML(text) {
  return text.split('\n').map(line => {
    const m = line.trim().match(/(https?:\/\/\S+\.(?:png|jpe?g|gif|webp))/i);
    if (m) {
      return `<img src="${m[1]}" alt="Question image" style="max-width:100%;height:auto;margin:12px 0;">`;
    }
    return `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }).join('');
}


// ─── Show Result & Restart ───────────────────────────────────────────────────
function showResult() {
  clearInterval(countdownInterval);
  saveScoreToHistory(score, questions.length);

  document.getElementById("quiz").style.display = "none";
  document.getElementById("finalResult").style.display = "block";
  document.getElementById("finalResult").innerHTML = `
    <h2>Your Score: ${score}/${questions.length}</h2>
    <button id="restartQuizBtn" style="margin-top: 16px;">Restart Quiz</button>
  `;
  finishBtn.style.display = "none";

  displayScoreHistory();
  document.getElementById("scoreHistory").style.display = "block";

  document.getElementById("restartQuizBtn").addEventListener("click", () => {
    score = 0;
    currentQuestion = 0;
    showingFeedback = false;
    quizStartTime = new Date();

    clearInterval(countdownInterval);
    totalTimeSeconds = 90 * 60;
    startTimer();

    questions.sort(() => Math.random() - 0.5);
    document.getElementById("quiz").style.display = "block";
    document.getElementById("finalResult").style.display = "none";
    loadQuestion();
  });

  const summaryDiv = document.getElementById("summaryPage");
  summaryDiv.innerHTML = "<h3>Question Summary</h3>";

  userAnswers.forEach((entry, index) => {
    const isCorrect =
      entry.selected.length === entry.correct.length &&
      entry.correct.every(ans => entry.selected.includes(ans));

    const explanationHTML = entry.explanation
      ? `<p><strong>Explanation:</strong><br>${entry.explanation}</p>`
      : "";

    const questionHTML = `
      <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 12px;">
        <p><strong>Q${index + 1}:</strong></p>
        ${renderQuestionHTML(entry.question)}
        <p><strong>Your Answer:</strong><br>${renderAnswerHTML(entry.selected)}</p>
        <p><strong>Correct Answer:</strong><br>${renderAnswerHTML(entry.correct)}</p>
        <p>${isCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
        ${explanationHTML}
      </div>
    `;

    summaryDiv.innerHTML += questionHTML;
  });

    
    // Hide quiz and show summary
    document.getElementById("quiz").style.display = "none";
    document.getElementById("finalResult").style.display = "block";
    document.getElementById("scoreHistory").style.display = "block";
    summaryDiv.style.display = "block";

}


// ─── Bootstrap ───────────────────────────────────────────────────────────────

finishBtn.style.display = "none";
loadQuestion();
startTimer();
