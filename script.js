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
        let energy = 1000;
        let maxEnergy = 1000;
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
            }
        }

        clicker.addEventListener('click', () => {
            if (energy >= profitPerClick) {
                balance += profitPerClick;
                energy -= profitPerClick;
                balanceDisplay.textContent = balance;
                updateEnergyBar();
            } else {
                alert('Not enough energy!');
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
                energy = Math.min(energy + 3, maxEnergy);
                updateEnergyBar();
            }
        }, 100);

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
