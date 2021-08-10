const Bot = require('node-stockly');
const { getStockInfo, purchaseStock } = require('./controller/stockController');
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
    const array = command.message.split(' ');
    if(array[1] === 'balance' || array[1] === 'b'){
        const response = await getUserBalance(command.userId);
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
        ;
    }else if((array[1] === 'stock' || array[1] === 's') && array[2]){
        const response = await getStockInfo(array[2]);
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
    }else if((array[1] === 'buy' || array[2] === 'b') && array[2] && array[3]){
        const response = await purchaseStock(command.userId ,array[2], array[3]);
        if(response) {
            trade.sendMessage(response.message)
        }else{
            trade.sendMessage('Something Wrong Try Again Later')
        }
    }
}); 