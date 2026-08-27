const characterSets = {
  lowercase: 'abcdefghjkmnpqrstuvwxyz',
  uppercase: 'ABCDEFGHJKMNPQRSTUVWXYZ',
  numbers: '23456789',
  symbols: '!@#$%^&*_-+=?'
};

const passwordInput = document.getElementById('password');
const lengthInput = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const strength = document.getElementById('strength');
const status = document.getElementById('copy-status');
const optionInputs = Object.keys(characterSets).map((key) => document.getElementById(key));

function randomIndex(limit) {
  const range = 0x100000000;
  const usableRange = Math.floor(range / limit) * limit;
  const values = new Uint32Array(1);
  do { crypto.getRandomValues(values); } while (values[0] >= usableRange);
  return values[0] % limit;
}

function shuffle(characters) {
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }
  return characters;
}

function selectedSets() {
  return optionInputs.filter((input) => input.checked).map((input) => characterSets[input.id]);
}

function updateStrength(setCount, length) {
  const label = length >= 16 && setCount >= 3 ? 'Strong' : length >= 12 && setCount >= 2 ? 'Good' : 'Basic';
  strength.textContent = label;
}

function generatePassword() {
  let sets = selectedSets();
  if (!sets.length) {
    document.getElementById('lowercase').checked = true;
    sets = selectedSets();
  }
  const length = Number(lengthInput.value);
  const password = sets.map((set) => set[randomIndex(set.length)]);
  const allCharacters = sets.join('');
  while (password.length < length) password.push(allCharacters[randomIndex(allCharacters.length)]);
  passwordInput.value = shuffle(password).join('');
  lengthValue.textContent = length;
  updateStrength(sets.length, length);
  status.textContent = 'Fresh password generated';
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(passwordInput.value);
    status.textContent = 'Password copied securely';
    document.getElementById('copy-button').textContent = 'Copied';
  } catch {
    passwordInput.select();
    document.execCommand('copy');
    status.textContent = 'Password copied';
  }
  window.setTimeout(() => { document.getElementById('copy-button').textContent = 'Copy'; }, 1600);
}

lengthInput.addEventListener('input', generatePassword);
optionInputs.forEach((input) => input.addEventListener('change', generatePassword));
document.getElementById('generate-button').addEventListener('click', generatePassword);
document.getElementById('copy-button').addEventListener('click', copyPassword);
generatePassword();
