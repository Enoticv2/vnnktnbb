Telegram.WebApp.ready(); // Сообщить Telegram, что ваше приложение загружено и готово

const initData = Telegram.WebApp.initData || '';
const initDataUnsafe = Telegram.WebApp.initDataUnsafe || {};

// Получаем данные пользователя
const user = initDataUnsafe.user;
if (user) {
    console.log(`Logged in as ${user.first_name} ${user.last_name}`);
} else {
    console.log("User not authenticated");
}

let balance = 0;
let energy = 100;
let maxEnergy = 100;
const refillCooldown = 3 * 60 * 60 * 1000; // 3 часа в миллисекундах
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
        balanceDisplay.textContent = balance;
        updateEnergyBar();
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
        balanceDisplay.textContent = balance;
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
        balanceDisplay.textContent = balance;
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

updateEnergyBar();
updateRefillButton();

function sendUpdate(event) {
    const data = {
        user_id: user.id,
        balance: balance,
        energy: energy,
        event: event
    };

    fetch(' t.me/FanHockeyBot/FanHockey', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
}
