const Bot = require('node-stockly');
const { getStockInfo, purchaseStock, sellStock, resetAccount, getStockForUser } = require('./controller/stockController');
const { getUserBalance } = require('./controller/userController');
const trade = new Bot.Client();
trade.login('Iar6dwzeJurVwVhL7ZSxXSjrzqmOcSYc', '462693043262755463');

// bot connection
trade.on('open', () => {
    console.log('Bot connected to the server');
});
  
// if getting error in connection
trade.on('error', (error) => {
    console.log(error);
}); 

trade.on('command', async (command) => {
    console.log('command', command)
    const array = command.message.split(' ');
    if(array[1] === 'balance' || array[1] === 'b'){
        // b or balance ---getCurrent balance
        const response = await getUserBalance(command.userId);
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
        ;
    }else if((array[1] === 'stock' || array[1] === 's') && array[2]){
        // stock or s stockName - get the stock current price
        const response = await getStockInfo(array[2]);
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
    }else if((array[1] === 'buy') && array[2] && array[3]){
        // buy stockname quantity - for buy bot with current market price with quantity
        const response = await purchaseStock(command.userId ,array[2], array[3]);
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
    }else if((array[1] === 'sell') && array[2] && array[3]){
        // sell stockId quantity - for sell bot with current market price with quantity
        const response = await sellStock(command.userId ,array[2], array[3]);
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
    }else if(array[1] === 'reset'){
        // reset - for reset user account it 10000
        const response = await resetAccount(command.userId);
        console.log(response)
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
    }else if(array[1] === 'mystocks' || array[1] === 'ms'){
        const response = await getStockForUser(command.userId);
        console.log(response)
        if(response && response.stocksData && response.stocksData.length > 0) {
            response.stocksData.forEach((element)=>{
                  console.log(element.message)
                  trade.sendMessage(element.message)
                })
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
    }
    else{
        trade.sendMessage('Invalid Command')

    }

}); 