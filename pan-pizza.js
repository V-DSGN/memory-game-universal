    const SCRIPT_PATH = document.currentScript.src;
    const BASE_PATH = SCRIPT_PATH.substring(0, SCRIPT_PATH.lastIndexOf('/') + 1);

/* ─────────────────────────────────────────────────────────────
   CAPTION PLATE SETTINGS (the dark block at the bottom of a card)
   These values are the only part meant to be edited.
   ───────────────────────────────────────────────────────────── */
const CAPTION = {
  badgeMatched: '✅',     // badge above the text on a correct pair ('' for no badge)
  badgeIncorrect: '❌',   // badge above the text on a miss
  maxLines: 3,            // max lines of the caption (0 — unlimited, plate grows with the text)
  fadeStart: 0,           // gradient opacity at the top: 0 = fully transparent
  fadeMiddle: 0.35,       // gradient opacity halfway down the plate
  fadeBottom: 0.8,        // gradient opacity at the very bottom (0.8 = 80%, not solid black)
  paddingTop: 24,         // px — headroom the transparent part of the gradient stretches over
  paddingSide: 10,        // px — left and right padding
  paddingBottom: 8,       // px — gap from the bottom edge of the card
  lineHeight: 1.2,        // line height
  bottomRadius: 14        // px — rounding of the two bottom corners, fixed
                          // regardless of how tall the plate grows
                          // (null — leave whatever your CSS sets)
};

function injectCaptionStyles() {
  /* Bottom corners get a fixed radius in px, so the rounding stays the same
     whether the plate is one line tall or three. Set CAPTION.bottomRadius to
     null to leave the page's own CSS in charge instead. */
  const radius = typeof CAPTION.bottomRadius === 'number'
    ? `border-bottom-left-radius: ${CAPTION.bottomRadius}px !important;
       border-bottom-right-radius: ${CAPTION.bottomRadius}px !important;`
    : '';

  const css = `
    .card[data-label]::after,
    .card[data-label]::before {
      /* pin the plate to the bottom edge of the card */
      top: auto !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: auto !important;

      /* height follows the text instead of being fixed:
         the plate stretches to wrap it */
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;

      /* the text wraps over several lines instead of being clipped to one.
         overflow is deliberately visible: the card is flipped in 3D, and
         inside such a layer the browser ignores overflow clipping — an extra
         line would just paint over the page. So nothing is clipped, the plate
         is free to grow, and the line limit is enforced by fitCardNames(). */
      /* pre-line: a line break inside data-label becomes a real break, so the
         ✅/❌ badge sits on its own line ABOVE the text and does not shift
         the start of the first line */
      white-space: pre-line !important;
      overflow: visible !important;
      overflow-wrap: break-word !important;
      display: block !important;

      box-sizing: border-box !important;
      padding: ${CAPTION.paddingTop}px ${CAPTION.paddingSide}px ${CAPTION.paddingBottom}px !important;
      line-height: ${CAPTION.lineHeight} !important;

      /* gradient instead of a flat semi-transparent fill:
         fully transparent at the top, darkening towards the bottom */
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, ${CAPTION.fadeStart}) 0%,
        rgba(0, 0, 0, ${CAPTION.fadeMiddle}) 45%,
        rgba(0, 0, 0, ${CAPTION.fadeBottom}) 100%
      ) !important;

      ${radius}
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.id = 'card-caption-styles';
  styleElement.textContent = css;
  document.head.appendChild(styleElement);
}

/* Builds the caption text for the plate.
   Without a badge — the name only, no prefix in front of the text.
   With a badge — the badge on its own line above the name. */
function labelText(cardElement, badge) {
  const name = cardElement.dataset.name || '';
  return badge ? badge + '\n' + name : name;
}

/* Caps the caption at a number of lines.
   Measures the real text height with a hidden ruler and, when it doesn't fit
   into CAPTION.maxLines lines, shortens the name word by word with an
   ellipsis. That keeps the plate from ever growing past the card. */
function fitCardNames() {
  if (CAPTION.maxLines <= 0) return;

  const cards = document.querySelectorAll('#game-container .card');
  if (!cards.length) return;

  const ruler = document.createElement('div');
  ruler.setAttribute('aria-hidden', 'true');
  ruler.style.cssText =
    'position:absolute;left:-9999px;top:0;visibility:hidden;' +
    'white-space:normal;overflow-wrap:break-word;';
  document.body.appendChild(ruler);

  cards.forEach((card) => {
    // remember the original name so measuring always starts from it
    if (!card.dataset.fullName) card.dataset.fullName = card.dataset.name || '';
    const fullName = card.dataset.fullName;
    if (!fullName) return;

    const labelStyle = getComputedStyle(card, '::after');
    const innerWidth = card.clientWidth - CAPTION.paddingSide * 2;
    const lineHeightPx =
      parseFloat(labelStyle.lineHeight) ||
      parseFloat(labelStyle.fontSize) * CAPTION.lineHeight;

    if (!(innerWidth > 0) || !(lineHeightPx > 0)) return;

    // copy the plate's own text metrics onto the ruler
    ruler.style.width = innerWidth + 'px';
    ruler.style.fontFamily = labelStyle.fontFamily;
    ruler.style.fontSize = labelStyle.fontSize;
    ruler.style.fontWeight = labelStyle.fontWeight;
    ruler.style.fontStyle = labelStyle.fontStyle;
    ruler.style.letterSpacing = labelStyle.letterSpacing;
    ruler.style.textTransform = labelStyle.textTransform;
    ruler.style.lineHeight = lineHeightPx + 'px';

    // +1px slack for rounding. Only the name's own lines are counted here:
    // the ✅/❌ badge adds its own line on top of them.
    const limit = lineHeightPx * CAPTION.maxLines + 1;
    const fits = (text) => {
      ruler.textContent = text;
      return ruler.offsetHeight <= limit;
    };

    if (fits(fullName)) {
      card.dataset.name = fullName;
      return;
    }

    const words = fullName.split(' ');
    let shortened = '';

    for (let i = words.length - 1; i > 0; i--) {
      const candidate = words.slice(0, i).join(' ') + '…';
      if (fits(candidate)) {
        shortened = candidate;
        break;
      }
    }

    // fallback for a single very long word — cut it by characters
    if (!shortened) {
      let cut = fullName;
      while (cut.length > 1 && !fits(cut + '…')) cut = cut.slice(0, -1);
      shortened = cut + '…';
    }

    card.dataset.name = shortened;
  });

  ruler.remove();
}

document.addEventListener('DOMContentLoaded', () => {

    injectCaptionStyles();


const timerStartElement = document.querySelector('.timer-start-text');
const timerDefaultElement = document.querySelector('.timer-default-text');
const timerWarningElement = document.querySelector('.timer-warning-text');

const timerStartText = timerStartElement.textContent.trim();
const timerDefaultText = timerDefaultElement.textContent.trim();
const timerWarningText = timerWarningElement.textContent.trim();

const timerStartColor = getComputedStyle(timerStartElement).color;
const timerDefaultColor = getComputedStyle(timerDefaultElement).color;
const timerWarningColor = getComputedStyle(timerWarningElement).color;

const matchConfettiEmojisText = document
  .querySelector('.match-confetti-emojis')
  .textContent
  .trim();

const winConfettiEmojisText = document
  .querySelector('.win-confetti-emojis')
  .textContent
  .trim();

function parseEmojiList(text) {
  return text
    .split(',')
    .map((emoji) => emoji.trim())
    .filter(Boolean);
}

const matchConfettiEmojis = parseEmojiList(matchConfettiEmojisText);
const winConfettiEmojis = parseEmojiList(winConfettiEmojisText);

function renderTimerText(template, timer) {
  return template.replaceAll('{timer}', timer);
}

    
    const frontImage = document.querySelector('.front-source-image')?.src;

    const cardsArray = Array.from(document.querySelectorAll('.card-source')).map((el, index) => {
    const cardImage = el.querySelector('.card-source-image');
    const cardName = el.querySelector('.card-source-name');

    return {
    id: el.dataset.cardId || index + 1,
    img: cardImage?.src,
    cardName: cardName?.textContent.trim()
  };
});
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

    const timerConfig = document.querySelector('.timer-config');
    const timerDuration = Number(timerConfig.dataset.timerDuration);
    
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let timer = timerDuration;
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
  cardElement.dataset.name = card.cardName;

  const frontFace = document.createElement('img');
  frontFace.src = frontImage;
  frontFace.alt = 'Card front';
  frontFace.className = 'front-face';

  const backFace = document.createElement('img');
  backFace.src = card.img;
  backFace.alt = card.cardName;
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
                firstCard.dataset.label = labelText(firstCard);
                firstCard.classList.add('selected');
            }, 250);
            
            return;
        }

        secondCard = this;

        setTimeout(() => {
            secondCard.dataset.label = labelText(secondCard);
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
            emojis: matchConfettiEmojis,
            emojiSize: 40
        });
    }
    

    function setMatched() {
        lockBoard = true;
        
        // Delay the marking 
        setTimeout(() => {
            firstCard.classList.add('matched');
            secondCard.classList.add('matched');
            firstCard.dataset.label = labelText(firstCard, CAPTION.badgeMatched);
            secondCard.dataset.label = labelText(secondCard, CAPTION.badgeMatched);
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
            firstCard.dataset.label = labelText(firstCard, CAPTION.badgeIncorrect);
            secondCard.dataset.label = labelText(secondCard, CAPTION.badgeIncorrect);

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
      timerDisplay.style.color = timerDefaultColor;
      timerDisplay.textContent = renderTimerText(timerDefaultText, timer);
    
      countdown = setInterval(() => {
        timer--;
    
        if (timer <= 10) {
          timerDisplay.style.color = timerWarningColor;
          timerDisplay.textContent = renderTimerText(timerWarningText, timer);
        } else {
          timerDisplay.style.color = timerDefaultColor;
          timerDisplay.textContent = renderTimerText(timerDefaultText, timer);
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
        fitCardNames();

        timer = timerDuration;
        
        timerDisplay.textContent = renderTimerText(timerStartText, timer);
        timerDisplay.style.color = timerStartColor;

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
                emojis: winConfettiEmojis,
                emojiSize: 100
            });
        }, 2000);
    }
  
    shuffle(cardsArray);
    cardsArray.forEach(card => gameContainer.appendChild(createCard(card)));
    fitCardNames();
    timerDisplay.textContent = renderTimerText(timerStartText, timer);
    timerDisplay.style.color = timerStartColor;
});
