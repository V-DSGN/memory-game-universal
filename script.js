document.addEventListener('DOMContentLoaded', () => {
    const cardsArray = [
  {
    id: 1,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04b41932edd925a41c2_card-1-1.png', crustName: "Margherita"
  },
  {
    id: 1,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04b9b4a6a6599530b9a_card-1-2.png', crustName: "Five Cheeses"
  },

  {
    id: 2,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04bd29e0661dc228446_card-2-1.png', crustName: "Napoletana"
  },
  {
    id: 2,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04bb7f0a045faadce51_card-2-2.png', crustName: "Tonno & Cipollo"
  },

  {
    id: 3,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04b91816e07f6fcf04f_card-3-1.png', crustName: "Pepperoni" 
  },
  {
    id: 3,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04b54fd72aab0062943_card-3-2.png', crustName: "Ham & Pineapple"
  },

  {
    id: 4,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04bdf316c5684a9d976_card-4-1.png', crustName: "Noduja (Vegan)"
  },
  {
    id: 4,
    img: 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef04baaeb4c0d227c9615_card-4-2.png', crustName: "Marinara"
  }
    ];
    const gameContainer = document.getElementById('game-container');
    const timerDisplay = document.getElementById('timer');
    const retryButton = document.getElementById('retryButton');
    retryButton.addEventListener('click', resetGame);
    const playAgainButton = document.getElementById('playAgainButton');
    playAgainButton.addEventListener('click', resetGame);

    var debugButtonWin = document.getElementById('debugButtonWin');
    if (debugButtonWin) {
        debugButtonWin.addEventListener('click', celebrateWin);
    }

    var debugButtonGameOver = document.getElementById('debugButtonGameOver');
    if (debugButtonGameOver) {
        debugButtonGameOver.addEventListener('click', showGameOverModal);
    }


    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let timer = 20;
    let countdown;
    let gameStarted = false;
    let matchesCount = 0;

    const jsConfetti = new JSConfetti(); 
   
    

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }

    function createCard(card) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        cardElement.dataset.crust = card.crustName;

        const frontFace = document.createElement('img');
        frontFace.src = 'https://cdn.prod.website-files.com/6a0eeedccf84ccc592f56b66/6a0ef5c83e9ed8b159e4cd9a_logo.png';  // Adjust path if necessary
        frontFace.className = 'front-face';

        const backFace = document.createElement('img');
        backFace.src = card.img;  // Adjust path if necessary
        backFace.className = 'back-face';

        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);
        cardElement.addEventListener('click', flipCard);
        return cardElement;
    }

    function flipCard() {
        if (lockBoard) return;
        
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        if (this === firstCard) return;

        this.classList.toggle('flip');

        if (!firstCard) {
            firstCard = this;

            setTimeout(() => {
                firstCard.dataset.label = `❔ ${firstCard.dataset.crust}`;
                firstCard.classList.add('selected');
            }, 250);
            
            return;
        }

        secondCard = this;

        setTimeout(() => {
            secondCard.dataset.label = `❔ ${secondCard.dataset.crust}`;
            secondCard.classList.add('selected');
        }, 250);

        checkTwoCardsForMatch();
    }

    function checkTwoCardsForMatch() {

        //block board until we decide what to click next.
        lockBoard = true;

        let isMatch = firstCard.dataset.id === secondCard.dataset.id;

        if (isMatch) {
            setMatched();
            matchesCount++;
            if (matchesCount === cardsArray.length / 2) {
                celebrateWin();
            }
        } else {
            setIncorrect();
        }
    }

    function celebrateMatch() {
        // Confetti configuration for a small burst around the matched cards
               

        jsConfetti.addConfetti({
            emojis: ['✅',''],
            emojiSize: 40
        });
    }
    

    function setMatched() {
        lockBoard = true;
        
        // Delay the marking 
        setTimeout(() => {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            firstCard.dataset.label = `✅ ${firstCard.dataset.crust}`;
            secondCard.dataset.label = `✅ ${secondCard.dataset.crust}`;
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            celebrateMatch(); 
            resetBoard();
        },500);

        
    }

    function setIncorrect() {
       
        lockBoard = true;

        // Delay the marking and the flip back
        setTimeout(() => {
            firstCard.classList.add('incorrect');
            secondCard.classList.add('incorrect');
            firstCard.dataset.label = `❌ ${firstCard.dataset.crust}`;
            secondCard.dataset.label = `❌ ${secondCard.dataset.crust}`;

            // Wait another 1000 milliseconds to flip them back
            setTimeout(() => {
                firstCard.classList.remove('flip', 'incorrect', 'selected');
                secondCard.classList.remove('flip', 'incorrect', 'selected');
                resetBoard();
            }, 1000);
        }, 500);  // First delay of 500 milliseconds before showing the ❌
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function startTimer() {
        timerDisplay.textContent = `⏱️ Time left: ${timer} seconds`;
        countdown = setInterval(() => {
            timer--;
            

            if (timer <= 5) {
                timerDisplay.style.color = 'red';
                timerDisplay.textContent = `⚠️ Time left: ${timer} seconds`;
            } else {
                timerDisplay.style.color = '#8F2222';
                timerDisplay.textContent = `⏱️ Time left: ${timer} seconds`;
            }

            if (timer === 0) {
                clearInterval(countdown);
                showGameOverModal();
            }
        }, 1000);
    }

    function resetGame() {
        gameContainer.innerHTML = '';
        shuffle(cardsArray);
        cardsArray.forEach(card => gameContainer.appendChild(createCard(card)));



        timer = 20;
        timerDisplay.textContent = `Turn a card to start! ⏱️ You've got ${timer} seconds!`;
        timerDisplay.style.color = '#8F2222';

        matchesCount = 0;
        gameStarted = false;

        firstCard = null;
        secondCard = null;

        document.getElementById('gameOverModal').style.display = 'none';
        document.getElementById('winModal').style.display = 'none';
    }

    function celebrateWin() {
        setTimeout(() => {
            clearInterval(countdown);
            //alert("Wow! You won!");
            confettiLarge();
            //resetGame();
            showWinModal();
        }, 1000);
    }

    function showGameOverModal() {
        clearInterval(countdown);
        document.getElementById('gameOverModal').style.display = 'block';
    }
    
    function showWinModal() {
        clearInterval(countdown);
        document.getElementById('winModal').style.display = 'block';
    }

    function confettiLarge() {
        // Continuous confetti for winning the game
        var end = Date.now() + (15 * 1000); // Run for 15 seconds
    
        var interval = setInterval(function() {
            if (Date.now() > end) {
                return clearInterval(interval);
            }
    
            jsConfetti.addConfetti({
                emojis: ['🍕','🏆', '⭐'],
                emojiSize: 100
            });
        }, 2000);
    }

    

    shuffle(cardsArray);
    cardsArray.forEach(card => gameContainer.appendChild(createCard(card)));
});
