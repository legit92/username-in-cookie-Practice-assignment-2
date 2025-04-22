const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');
const checkButton = document.getElementById('check');

// a function to store in the local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// a function to retrieve from the local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

function getRandomArbitrary(min, max) {
  let cached;
  cached = Math.random() * (max - min) + min;
  cached = Math.floor(cached);
  return cached;
}

// a function to clear the local storage
function clear() {
  localStorage.clear();
}

// a function to generate sha256 hash of the given string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) {
    return cached;
  }
  const randomNum = getRandomArbitrary(MIN, MAX).toString();
  cached = await sha256(randomNum);
  store('sha256', cached);
  return cached;
}

async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = 'not 3 digits';
    resultView.classList.remove('hidden');
    return;
  }

  const hasedPin = await sha256(pin);

  if (hasedPin === sha256HashView.innerHTML) {
    resultView.innerHTML = 'success';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = 'failed';
  }
  resultView.classList.remove('hidden');
}

// ensure pinInput only accepts numbers and is 3 digits long
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// attach the test function to the button
checkButton.addEventListener('click', test);

main();

async function bruteForcePin() {
  const targetHash = sha256HashView.innerText;
  for (let i = 100; i <= 999; i++) {
    const guess = i.toString();
    const guessHash = await sha256(guess);
    if (guessHash === targetHash) {
      console.log("Found PIN:", guess);
      pinInput.value = guess;
      checkButton.click();
      return;
    }
  }
  console.log("No match found!");
}

setTimeout(() => {
  bruteForcePin();
}, 1000);