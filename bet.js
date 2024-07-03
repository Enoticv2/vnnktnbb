// Обработка выбора позиций для ставок
var positionButtons = document.querySelectorAll('.position');
var modal = document.getElementById("playerSelectionModal");
var span = document.getElementsByClassName("close")[0];
var playerCardsContainer = document.getElementById("playerCards");

positionButtons.forEach(button => {
    button.addEventListener('click', function() {
        var position = button.getAttribute('data-position');
        showPlayerSelectionModal(position, button);
    });
});

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


function showPlayerSelectionModal(position, button) {
    playerCardsContainer.innerHTML = ''; // Clear previous players
    var players = getPlayersByPosition(position);
    players.forEach(player => {
        var playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `<img src="${player.image}" alt="${player.name}"><p>${player.name}</p>`;
        playerCard.addEventListener('click', function() {
            selectPlayer(player, button);
        });
        playerCardsContainer.appendChild(playerCard);
    });
    modal.style.display = "block";
}

function getPlayersByPosition(position) {
    // This should be replaced with actual data retrieval
    var allPlayers = {
        leftForward: [
            { name: 'Ovechkin', image: 'img/NHL/LW/ovi.png' },
            { name: 'Panarin', image: 'img/NHL/LW/panarin.png' },
            { name: 'Filippov', image: 'img/MHL/LW/Filipov.png' },
        ],
        centerForward: [
            { name: 'Crosbi', image: 'img/NHL/C/crosbi.png' },
            { name: 'McDavid', image: 'img/NHL/C/mcdavid.png' },
        ],
        rightForward: [
            { name: 'Kucherov', image: 'img/NHL/RW/kucherov.png' },
            { name: 'Pastarnak', image: 'img/NHL/RW/pastarnak.png' },
            { name: 'Kolesnikov', image: 'img/MHL/RW/Kolesnikov.png' },
        ],
        leftDefense: [
            { name: 'Hedman', image: 'img/NHL/D/hedman.png' },
            { name: 'Makar', image: 'img/NHL/D/Makar.png' },
            { name: 'Nikitin', image: 'img/NHL/D/Nikitin.png' },
            { name: 'Tsulygin', image: 'img/KHL/D/tsulya.png' },
        ],
        rightDefense: [
            { name: 'Hedman', image: 'img/NHL/D/hedman.png' },
            { name: 'Makar', image: 'img/NHL/D/Makar.png' },
            { name: 'Nikitin', image: 'img/NHL/D/Nikitin.png' },
            { name: 'Tsulygin', image: 'img/KHL/D/tsulygin.png' },
        ],
        goalie: [
            { name: 'Bobrovskiy', image: 'img/NHL/G/bobrovski.png' },
            { name: 'Vasilevskiy', image: 'img/NHL/G/vasilevskiy.png' },
        ]
    };

    return allPlayers[position] || [];
}

function selectPlayer(player, button) {
    button.innerHTML = `<img src="${player.image}" alt="${player.name}" class="player-img"><p>${player.name}</p>`;
    modal.style.display = "none";
}