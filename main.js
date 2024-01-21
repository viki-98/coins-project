coinsStart()
const selectedCoins = []

//start point

async function coinsStart() {
    const data = await getData()
    displayLoader()
    displayCoins(data)
}

//get all data

async function getData() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?order=market_cap_desc&vs_currency=usd')
    const data = response.json()
    return data
}

// get data by coin id

async function getDataByCoinId(coinId) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
    const data = response.json()
    return data
}

//create card and display them

function displayCoins(coins) {
    let content = ''
    for (const coin of coins) {
        const card = createCard(coin)
        content += card
    }
    const coinsDOM = document.getElementById('coins')
    coinsDOM.innerHTML = content
}

function createCard(coin) {
    const card = `

            <div class="card" id="card-${coin.id}" data-symbol="${coin.symbol}">

                <div class="card-header">
                    <div class="card-symbol-wrapper">
                        <img src="${coin.thumb ? coin.thumb : coin.image}" alt="coin"
                            class="card-img" />
                        <span class="card-symbol">${coin.symbol}</span>
                    </div>
                    <div class="card-switch-wrapper">
                        <label class="switch">
                            <input type="checkbox" id="switch-${coin.id}" data-switch-item=${coin.symbol} onclick="handleLiveReport('${coin.symbol}')">
                            <span class="slider round"></span>
                        </label>

                        Live Reports

                    </div>


                </div>

                <div class="card-body">
                    <span class="card-id">${coin.id}</span>
                    <button class="card-button" onclick="toggleCardDescription('${coin.id}')">More Info</button>
                </div>
                
                <div class="card-description" id="price-${coin.id}" data-livesymbo="${coin.symbol}">
                
								</div>

              	 


            </div>

        `
    return card
}

//display card description

function toggleCardDescription(cardId) {
    coinPriceDetails(cardId)
}

async function coinPriceDetails(coinId) {
    const coinDetailsFromLocaleStorage = getCoinDetailsFromLocalStorage(coinId)
    const now = Date.now()
    if (coinDetailsFromLocaleStorage !== null && now - coinDetailsFromLocaleStorage.timestamp < 1000 * 120) {
        displayCoinInfo(coinDetailsFromLocaleStorage)
        return
    }

    const coinDetails = await getDataByCoinId(coinId)
    setCoinDetailsToLocalStorage(coinId, coinDetails)
    displayCoinInfo(coinDetails)
}

function displayCoinInfo(coinDetails) {
    const dataMarket = coinDetails.market_data
    const currentPrice = dataMarket.current_price

    let coinInfoContent = `
            
                     <div class="card-currency-usd">USD:${currentPrice.usd}$</div>
                    <div class="card-currency-eur">EUR: ${currentPrice.eur}&#8364;</div>
                     <div class="card-currency-ils">ILS: ${currentPrice.ils}&#8362;</div>
                 
        `

    const parents = document.getElementById(`price-${coinDetails.id}`)
    parents.innerHTML = coinInfoContent
    parents.classList.toggle('active')
}

//local storage helpers

function getCoinDetailsFromLocalStorage(coinId) {
    const coinDetails = localStorage.getItem(coinId)
    return JSON.parse(coinDetails)
}

function setCoinDetailsToLocalStorage(coinId, coinDetails) {
    coinDetails.timestamp = Date.now()
    localStorage.setItem(coinId, JSON.stringify(coinDetails))
}

//functions that fills the selectedCoins array for chart
// functions that call a modal window if the array is full
let lastOne

function handleLiveReport(coinSymbol) {
    const liveReportsTab = document.querySelectorAll('li[data-page=\'#liveReports\']')

    if (selectedCoins.includes(coinSymbol)) {
        const index = selectedCoins.indexOf(coinSymbol)
        selectedCoins.splice(index, 1)
    } else {
        selectedCoins.push(coinSymbol)
    }


    if (selectedCoins.length === 0) {
        liveReportsTab.forEach(tab => tab.classList.add('disabled'))
    } else {
        liveReportsTab.forEach(tab => tab.classList.remove('disabled'))
    }

    if (selectedCoins.length > 5) {

        let modalListContent = ''

        selectedCoins.forEach(function (selectedCoin) {
            let index = selectedCoins.indexOf(selectedCoin)

            if (index < 5) {
                const coinId = document.querySelector(`[data-symbol="${selectedCoin}"]`).getAttribute('data-symbol')

                modalListContent += `
                            <div class="modal-body-item" id=${coinId}>
                                <input checked="true" class="modalChecks"  type="checkbox" name="modalChecks" id="${coinId}">
                                <label for="${coinId}">
                                ${selectedCoin.toUpperCase()}
                                </label>
                            </div>
                       
                        `
            } else {
                lastOne = selectedCoin
            }
        })
        const modalHeader = document.querySelector('.modal-header .header-coin')
        modalHeader.innerHTML = lastOne.toUpperCase()
        const modalBody = document.querySelector('.modal-body')
        modalBody.innerHTML = modalListContent
        displayModal()
        checkModalClassListActive()

    }

}

function uncheckLastCoin() {
    document.querySelector('div.modal-body').innerHTML = ''
    document.querySelector(`input[data-switch-item="${lastOne}"]`).checked = false
    selectedCoins.splice(5, 1)
}

document.querySelector('.modal-body').addEventListener('change', function (event) {
    if (event.target.matches('.modalChecks')) {
        const uncheckedCoin = document.querySelector('.modalChecks:not(:checked)')
        const uncheckedCoinId = uncheckedCoin.getAttribute('id')
        document.querySelector(`[data-switch-item=${uncheckedCoinId}]`).checked = false

        const uncheckedCoinIndex = selectedCoins.indexOf(uncheckedCoinId)
        selectedCoins.splice(uncheckedCoinIndex, 1)
        closeModal()
        checkModalClassListActive()


    }
})

//Modal

const modal = document.querySelector('.modal-wrapper')
const modalClose = document.querySelector('.modal-close')
modalClose.addEventListener('click', () => {
    uncheckLastCoin()
    closeModal()
    checkModalClassListActive()
})

function displayModal() {
    modal.classList.toggle('active')
}

function closeModal() {
    modal.classList.remove('active')
}

function checkModalClassListActive() {
    if (modal.classList.contains('active')) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = 'auto'
    }
}

window.addEventListener('resize', checkModalClassListActive)

//Load Founded Coins By Search Box

const formButtons = document.querySelectorAll(`[data-search-button]`)
formButtons.forEach(button => {
    button.addEventListener('click', () => {
        loadFoundedCoins()
        toggleBurger('close')
    })
})

async function loadFoundedCoins() {

    let searchValue = document.getElementById('searchValue').value
    let searchValueBurger = document.getElementById('searchValueBurger').value

    const formInputs = document.querySelectorAll(`.form-input`)


    let value
    if (searchValue !== '') {
        value = searchValue

    } else if (searchValueBurger !== '') {
        value = searchValueBurger
    } else if (searchValue === '' || searchValueBurger === '') {
        value = ''
    }

    if (value === '') {
        formInputs.forEach(input => {
            input.classList.add('incorrect')
            input.placeholder = 'Please enter a coin name...'
        })
    } else {
        formInputs.forEach(input => input.classList.remove('incorrect'))

        const coinsObjResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${value}`)

        const coinsObj = await coinsObjResponse.json()
        const coins = coinsObj.coins
        displayCoins(coins)

        searchValue = ''
        searchValueBurger = ''
        formInputs.forEach(input => {
            input.placeholder = 'Search'
        })

    }

}

//header box-shadow animation on scroll

window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        document.querySelector('.header').classList.add('active')
    } else {
        document.querySelector('.header').classList.remove('active')
    }
})

//Hamburger Menu

const hamburger = document.querySelector('.hamburger')
hamburger.addEventListener('click', () => {
    toggleBurger()
})
const menu = document.querySelector('.burger-navbar-wrapper')

function toggleBurger(param) {
    hamburger.classList.toggle('active')
    menu.classList.toggle('active')
    checkMenuClassListActive()
    if (param === 'close') {
        hamburger.classList.remove('active')
        menu.classList.remove('active')
        checkMenuClassListActive()
    }

}

window.addEventListener('resize', checkScreenWidth)

function checkScreenWidth() {

    const screenWidth = window.innerWidth

    const threshold = 769

    if (screenWidth > threshold || menu.classList.contains('active')) {
        toggleBurger('close')
    }
}



function checkMenuClassListActive() {
    if (menu.classList.contains('active')) {
        document.body.style.overflow = 'hidden'
    } else {
        document.body.style.overflow = 'auto'
    }
}


//Tabs

const tabs = document.querySelectorAll('.menu-tab')
const coinsPage = document.getElementById('coins')
const liveReportsPage = document.getElementById('liveReports')
const aboutPage = document.getElementById('about')

tabs.forEach((tab) => {
    const attributeValue = tab.getAttribute('data-page')
    tab.addEventListener('click', () => {
        tabs.forEach(tab => {
            tab.classList.remove('active')
        })


        tab.classList.add('active')


        if (attributeValue === '#coins') {
            liveReportsPage.classList.remove('activeLiveReportsTab')
            aboutPage.classList.remove('activeAboutTab')
            coinsPage.classList.add('activeCoinsTab')
        } else if (attributeValue === '#liveReports') {
            coinsPage.classList.remove('activeCoinsTab')
            aboutPage.classList.remove('activeAboutTab')
            liveReportsPage.classList.add('activeLiveReportsTab')
        } else if (attributeValue === '#about') {
            coinsPage.classList.remove('activeCoinsTab')
            liveReportsPage.classList.remove('activeLiveReportsTab')
            aboutPage.classList.add('activeAboutTab')
        }
        toggleBurger('close')
        displayLoader()

    })
})

//Chart

function coinsRepoVal() {
    let coinsLabel = []
    let coinsToRepo = ''

    selectedCoins.forEach((selectedCoin) => {
        coinsToRepo += selectedCoin + ','
        coinsLabel.push(selectedCoin.toUpperCase())
    })
    return {coinsToRepo, coinsLabel}
}

document.querySelectorAll('li[data-page=\'#liveReports\']').forEach(tab => {
    tab.addEventListener('click', function () {

        document.getElementById('liveReports').innerHTML = `<canvas id="myChart"></canvas>`

        async function currentPrice() {
            const coinsToRepo = coinsRepoVal().coinsToRepo

            let liveRepoObj = await getJson(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToRepo}&tsyms=USD`)
            const currentTime = Date.now()
            const liveRepoObjsArr = []
            const coinsCurrentPrice = []

            liveRepoObjsArr.push(liveRepoObj)

            for (const coin of liveRepoObjsArr) {
                for (const price in coin) {
                    coinsCurrentPrice.push(coin[price].USD)
                }
            }
            getChartLines(coinsCurrentPrice)
        }

        let dataPoints = []

        const data = {
            datasets: []
        }

        const config = {
            data, options: {
                transitions: {
                    show: {
                        animations: {
                            x: {
                                from: 0
                            }, y: {
                                from: 0
                            }
                        }
                    }, hide: {
                        animations: {
                            x: {
                                to: 0
                            }, y: {
                                to: 0
                            }
                        }
                    }
                }, plugins: {
                    title: {
                        display: true, text: 'Coins Live Reports', font: {
                            size: 28
                        }
                    }, streaming: {
                        duration: 20000, ttl: 60000, refresh: 2000
                    }
                }, interaction: {
                    intersect: false
                }, scales: {
                    x: {
                        title: {
                            display: true, text: 'Chart Updates every 2 secs', font: {
                                size: 20
                            }
                        }, type: 'realtime'
                    }, y: {
                        title: {
                            display: true, text: 'Current Price in USD', font: {
                                size: 20
                            }
                        }, beginAtZero: true
                    }
                }, responsive: true, maintainAspectRatio: false
                // aspectRatio: 2,
                // maxWidth: 200,
                // maxHeight: 400
            }
        }

        const ourChart = new Chart(document.getElementById('myChart'), config)

        let count = 0
        let datasetsDataArr = {a0: [], a1: [], a2: [], a3: [], a4: []}
        const colors = ['Red', 'Blue', 'Yellow', 'Green', 'Orange']
        const coinsLabel = coinsRepoVal().coinsLabel

        for (let i = 0; i < coinsLabel.length; i++) {
            const coinLine = {
                type: 'line',
                label: coinsLabel[i],
                data: datasetsDataArr[`a` + i],
                backgroundColor: colors[i],
                borderColor: colors[4 - i],
                borderWidth: 1
            }
            data.datasets.push(coinLine)
            ourChart.update()
        }

        function getChartLines(coinsCurrentPrice) {
            for (let j = 0; j < coinsCurrentPrice.length; j++) {
                dataPoints[j] = {x: Date.now(), y: coinsCurrentPrice[j]}

                if (!datasetsDataArr[`a` + j]) {
                    datasetsDataArr[`a` + j] = []
                }

                // Проверяем, существует ли массив перед вызовом push
                if (datasetsDataArr[`a` + j]) {
                    datasetsDataArr[`a` + j].push(dataPoints[j])
                } else {
                    console.error(`Array datasetsDataArr['a${j}'] is undefined at index ${j}`)
                }
                count++
            }
            ourChart.update()
        }

        intervalId = setInterval(function () {
            currentPrice()
        }, 2000)

        window.addEventListener('resize', function () {
            ourChart.resize()
        })


    })
})

function getJson(url) {
    return fetch(url)
        .then(response => response.json())
        .catch(error => console.error('Error:', error))
}


function displayLoader() {
    const loader = document.querySelector('.loader-wrapper');

    document.body.style.overflow = 'hidden';

    loader.classList.toggle('active');

    setTimeout(() => {
        loader.classList.toggle('active');
        document.body.style.overflow = 'auto';
    }, 1000);


}

