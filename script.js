let deck = [];
let boardCards = [];
let selectedCards = [];

let score = 0;
let combo = 1;
let timer = 0;
let setsFound = 0;
let interval;

const colors = ["red", "green", "blue"];
const shapes = ["oval", "diamond", "squiggle"];
const fills = ["solid", "striped", "empty"];
const counts = [1, 2, 3];

/* 카드 생성 */
function generateDeck() {
  deck = [];
  colors.forEach(c =>
    shapes.forEach(s =>
      fills.forEach(f =>
        counts.forEach(n =>
          deck.push({ color: c, shape: s, fill: f, count: n })
        )
      )
    )
  );
}

/* 시작 */
function startGame() {
  score = 0;
  combo = 1;
  timer = 0;
  setsFound = 0;
  selectedCards = [];

  generateDeck();
  shuffle(deck);

  boardCards = deck.splice(0, 12);

  updateUI();
  renderBoard();
  ensureSetExists();

  clearInterval(interval);
  interval = setInterval(() => {
    timer++;
    document.getElementById("timer").innerText = `Time: ${timer}s`;
  }, 1000);
}

/* 셔플 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* 렌더 */
function renderBoard() {
  const board = document.getElementById("game-board");
  board.innerHTML = "";

  boardCards.forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "card";

    for (let j = 0; j < card.count; j++) {
      const shape = document.createElement("div");
      shape.className = `shape ${card.shape} ${card.color} ${card.fill}`;
      div.appendChild(shape);
    }

    div.onclick = () => selectCard(i);
    board.appendChild(div);
  });
}

/* 카드 선택 */
function selectCard(index) {
  if (selectedCards.length >= 3) return;

  const card = boardCards[index];
  const cardDivs = document.querySelectorAll(".card");

  const existing = selectedCards.indexOf(card);

  if (existing >= 0) {
    selectedCards.splice(existing, 1);
    cardDivs[index].classList.remove("selected");
  } else {
    selectedCards.push(card);
    cardDivs[index].classList.add("selected");
  }

  if (selectedCards.length === 3) {
    checkSet();
  }
}

/* SET 판별 */
function isSet(cards) {
  const attrs = ["color", "shape", "fill", "count"];

  return attrs.every(attr => {
    const values = cards.map(c => c[attr]);
    const size = new Set(values).size;
    return size === 1 || size === 3;
  });
}

/* 체크 */
function checkSet() {
  if (isSet(selectedCards)) {
    score += 10 * combo;
    combo++;
    setsFound++;

    document.getElementById("status").innerText = "✅ SET Found!";

    setTimeout(() => {
      replaceCards();
      selectedCards = [];
      renderBoard();
      ensureSetExists();
      updateUI();
    }, 300);

  } else {
    score = Math.max(0, score - 5);
    combo = 1;

    document.getElementById("status").innerText = "❌ Not a SET!";

    setTimeout(() => {
      selectedCards = [];
      renderBoard();
      updateUI();
    }, 500);
  }
}

/* 카드 교체 */
function replaceCards() {
  const indices = selectedCards
    .map(card => boardCards.indexOf(card))
    .sort((a, b) => b - a);

  indices.forEach(index => {
    if (deck.length > 0) {
      boardCards[index] = deck.shift();
    } else {
      boardCards.splice(index, 1);
    }
  });
}

/* SET 없으면 카드 추가 */
function ensureSetExists() {
  while (!findSet() && deck.length > 0) {
    boardCards.push(deck.shift());
  }
  renderBoard();
}

/* SET 찾기 */
function findSet() {
  for (let i = 0; i < boardCards.length; i++) {
    for (let j = i + 1; j < boardCards.length; j++) {
      for (let k = j + 1; k < boardCards.length; k++) {
        if (isSet([boardCards[i], boardCards[j], boardCards[k]])) {
          return true;
        }
      }
    }
  }
  return false;
}

/* 힌트 */
function showHint() {
  score = Math.max(0, score - 1);

  const hint = findSetIndices();

  if (hint) {
    const cards = document.querySelectorAll(".card");
    hint.forEach(i => {
      cards[i].classList.add("hint");
      setTimeout(() => cards[i].classList.remove("hint"), 2000);
    });
  }

  updateUI();
}

/* 힌트용 인덱스 */
function findSetIndices() {
  for (let i = 0; i < boardCards.length; i++) {
    for (let j = i + 1; j < boardCards.length; j++) {
      for (let k = j + 1; k < boardCards.length; k++) {
        if (isSet([boardCards[i], boardCards[j], boardCards[k]])) {
          return [i, j, k];
        }
      }
    }
  }
  return null;
}

/* UI 업데이트 */
function updateUI() {
  document.getElementById("score").innerText = `Score: ${score}`;
  document.getElementById("combo").innerText = `Combo: x${combo}`;
  document.getElementById("sets").innerText = `Sets Found: ${setsFound}`;
  document.getElementById("remaining").innerText =
    `Remaining Cards: ${deck.length + boardCards.length}`;
}

/* 이벤트 */
document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("hint").addEventListener("click", showHint);
