Telegram.WebApp.ready();

const initDataUnsafe = Telegram.WebApp.initDataUnsafe || {};
const user = initDataUnsafe.user || { id: null };

console.log("User data:", user);

let balance = 0;
let energy = 100;
let maxEnergy = 100;
const refillCooldown = 3 * 60 * 60 * 1000;

const balanceDisplay = document.getElementById('balance');
const clicker = document.getElementById('clicker');
const newIcon = document.getElementById('new-icon');
const energyBar = document.getElementById('energy-bar');
const energyText = document.getElementById('energy-text');
const refillButton = document.getElementById('refill-button');
const upgradeProfitButton = document.getElementById('upgrade-profit-button');
const upgradeEnergyButton = document.getElementById('upgrade-energy-button');
const profitUpgradeCostDisplay = document.getElementById('profit-upgrade-cost');
const energyUpgradeCostDisplay = document.getElementById('energy-upgrade-cost');
const boostsButton = document.getElementById('boosts-button');
const boostsMenu = document.getElementById('boosts-menu');

let lastRefillTime = 0;
let profitPerClick = 1;
let profitUpgradeLevel = 1;
let profitUpgradeCost = 100;
let energyUpgradeCost = 100;

function enterApplication() {
    if (!user || !user.id) {
        console.error('User ID is not available');
        return;
    }

    fetch('https://836c-2a02-9130-8522-b09e-cf2-9ad6-283b-2737.ngrok-free.app/enter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: user.id })
    }).then(response => response.json())
      .then(data => {
        if (data.success) {
            console.log(`User ${user.id} entered the application`);
        } else {
            console.error('Failed to record user entry:', data.message);
        }
    })
    .catch(error => console.error('Error recording user entry:', error));
}

function loadUserData() {
    if (!user || !user.id) {
        console.error('User ID is not available');
        return;
    }

    console.log(`Fetching user data for user ID: ${user.id}`);

    fetch(`https://836c-2a02-9130-8522-b09e-cf2-9ad6-283b-2737.ngrok-free.app/user?user_id=${user.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                balance = data.user.balance;
                energy = data.user.energy;
                console.log(`Loaded user data: balance=${balance}, energy=${energy}`);
                updateDisplay();
            } else {
                console.error('Failed to load user data:', data.message);
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function updateDisplay() {
    balanceDisplay.textContent = balance;
    updateEnergyBar();
}

function updateEnergyBar() {
    energyBar.style.width = (energy / maxEnergy) * 100 + '%';
    energyText.textContent = `Energy: ${energy} / ${maxEnergy}`;
}

function updateRefillButton() {
    const currentTime = Date.now();
    const timeSinceLastRefill = currentTime - lastRefillTime;
    if (timeSinceLastRefill >= refillCooldown) {
        refillButton.classList.remove('disabled');
        refillButton.addEventListener('click', refillEnergy);
    } else {
        refillButton.classList.add('disabled');
        refillButton.removeEventListener('click', refillEnergy);
        const timeLeft = refillCooldown - timeSinceLastRefill;
        setTimeout(updateRefillButton, timeLeft);
    }
}

function refillEnergy() {
    if (!refillButton.classList.contains('disabled')) {
        energy = maxEnergy;
        updateEnergyBar();
        lastRefillTime = Date.now();
        updateRefillButton();
        sendUpdate('refillEnergy');
    }
}

clicker.addEventListener('click', () => {
    if (energy >= profitPerClick) {
        balance += profitPerClick;
        energy -= profitPerClick;
        updateDisplay();
        sendUpdate('click');
    } else {
        balance += 0;
    }
});

upgradeProfitButton.addEventListener('click', () => {
    if (balance >= profitUpgradeCost) {
        balance -= profitUpgradeCost;
        profitPerClick++;
        profitUpgradeLevel++;
        profitUpgradeCost *= 5;
        updateDisplay();
        profitUpgradeCostDisplay.textContent = `Cost: ${profitUpgradeCost}`;
        if (profitUpgradeLevel >= 3) {
            clicker.src = newIcon.src;
        }
        sendUpdate('upgradeProfit');
    } else {
        alert('Not enough balance to upgrade!');
    }
});

upgradeEnergyButton.addEventListener('click', () => {
    if (balance >= energyUpgradeCost) {
        balance -= energyUpgradeCost;
        maxEnergy += 500;
        energyUpgradeCost *= 5;
        updateDisplay();
        energyUpgradeCostDisplay.textContent = `Cost: ${energyUpgradeCost}`;
        updateEnergyBar();
        sendUpdate('upgradeEnergy');
    } else {
        alert('Not enough balance to upgrade!');
    }
});

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(energy + 1, maxEnergy);
        updateEnergyBar();
    }
}, 3000);

boostsButton.addEventListener('click', () => {
    boostsMenu.style.display = 'flex';
});

boostsMenu.addEventListener('click', (event) => {
    if (event.target === boostsMenu) {
        boostsMenu.style.display = 'none';
    }
});

function sendUpdate(event) {
    if (!user || !user.id) {
        console.error('User ID is not available');
        return;
    }

    const data = {
        user_id: user.id,
        balance: balance,
        energy: energy,
        event: event
    };

    console.log(`Sending update for user ${user.id}: balance=${balance}, energy=${energy}, event=${event}`);
    fetch('https://9cf7-83-40-74-107.ngrok-free.app/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => {
        console.log('Update response:', data);
      })
      .catch((error) => {
        console.error('Error sending update:', error);
      });
}

// Load user data and record ID when entering the application
enterApplication();
loadUserData();
updateEnergyBar();
updateRefillButton();
