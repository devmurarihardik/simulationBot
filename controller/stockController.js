const { getUsers, updateUserBalance } = require("../models/userModel");
const { purchaseStock, getStockById, deleteStockById, updateStock,  getStockTickersByUserId, deleteUsersAllStock, getStocksUserId } = require("../models/stockModel");
const Axios = require("axios");
const Bot = require('node-stockly');



exports.purchaseStock = async (userId, ticker, quantity) => {
  try {
    // const { userId, ticker, quantity, price } = req.body;
    console.log(userId, ticker, quantity)
    const user = await getUsers(userId);

    if (!user) {
      return ({
        status: "fail",
        message: "Some thing Wrong. i Can't Get You Account",
      });
    }
    const { current } = await this.getStockInfo(ticker);
    if(!current){
      return ({
        status: "fail",
        message: "Some thing Wrong. i Can't Get You Account",
      });
    }

    const totalPrice = quantity * current;
    if (user.balance < totalPrice) {
      return ({
        status: "fail",
        message: `You don't have enough cash to purchase this stock.`,
      });
    }

    // const purchase = new Stock({ userId, ticker, quantity, price });
    // await purchase.save();
    const purchase = await purchaseStock({ userId, ticker, quantity, current })
    console.log(purchase)
    await updateUserBalance(userId, {
      balance:
        Math.round((user.balance - totalPrice + Number.EPSILON) * 100) / 100,
        
    });

    return ({
      status: "success",
      stockId: purchase.id,
      message: `StockId: ${purchase.id} \n You Balance Is:- ${Math.round((user.balance - totalPrice) * 100) / 100}`,
      balance: Math.round((user.balance - totalPrice + Number.EPSILON) * 100) / 100,
    });
  } catch (error) {
    console.log(error)
    return ({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

exports.sellStock = async (userId, stockId, quantity ) => {
  try {
    console.log(userId, stockId, quantity)
    const stock = await getStockById({ stockId, userId });
    console.log('stock', stock)
    if (!stock) {
      return ({
        status: "fail",
        message: "Enter Valid Stock Id.",
      });
    }

    const user = await getUsers(userId);

    if (!user) {
      return ({
        status: "fail",
        message: "Credentials couldn't be validated.",
      });
    }

    const { current } = await this.getStockInfo(stock.ticker);
    console.log(current)
    if(!current){
      return ({
        status: "fail",
        message: "Some thing Wrong. i Can't Get You Account",
      });
    }

    if (Number(quantity) > Number(stock.quantity)) {
      return ({
        status: "fail",
        message: "Invalid quantity.",
      });
    }

    if (+quantity === +stock.quantity) {
      console.log('delete stock called')
      await deleteStockById(stockId, userId);
    } else {
      console.log('update stock called')
      await updateStock(stockId, {
        quantity: +stock.quantity - quantity,
      });
    }

    const saleProfit = +quantity * +current;

    await updateUserBalance(userId, {
      balance:
        Math.round((Number(user.balance) + saleProfit + Number.EPSILON) * 100) / 100,
    },);
    console.log(Math.round((Number(user.balance) + saleProfit + Number.EPSILON) * 100) / 100)
    return ({
      status: "success",
      balance: Math.round((Number(user.balance) + saleProfit + Number.EPSILON) * 100) / 100,
      message: `Stock Sold! \n  You Balance Is:- ${Math.round((Number(user.balance) + saleProfit) * 100) / 100}`
    });
  } catch (error) {
    console.log('final error', error)
    return ({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

const getPricesData = async (stocks) => {
  try {
    const promises = stocks.map(async (stock) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${stock.ticker.toUpperCase()}&token=c30d74aad3i9gms5ocrg`;
      const response = await Axios.get(url);
      return {
        storedData:{...stock},
        close: response.data.c,
        high: response.data.h,
        low: response.data.l,
        open: response.data.o,
        current: response.data.c,
        message:`\n id: ${stock.id} \n ticker: ${stock.ticker} \n price: ${stock.price} \n quantity: ${stock.quantity} \n \n ----Current Market--- \n close: ${response.data.pc} \n current: ${response.data.c} \n high: ${response.data.h} \n low: ${response.data.l} \n open: ${response.data.o}`
      };
    });

    return Promise.all(promises);
  } catch (error) {
    return [];
  }
};

exports.getStockInfo = async (ticker) => {
  try {
    console.log(ticker)
    const url = `https://finnhub.io/api/v1/quote?symbol=${ticker.toUpperCase()}&token=c30d74aad3i9gms5ocrg`;
    const response = await Axios.get(url);
    if(response && response.data){
     return {
        ticker,
        close: response.data.c,
        high: response.data.h,
        low: response.data.l,
        open: response.data.o,
        current: response.data.c,
        message:`
        ticker: ${ticker} \n
        close: ${response.data.pc} \n
        current: ${response.data.c} \n
        high: ${response.data.h} \n
        low: ${response.data.l} \n
        open: ${response.data.o} \n
        `
      };
    }
      return {
        message: 'Something Went Wrong Try Again Later'
      }
      // });

  } catch (error) {
    console.log(error)
    return {
      message: 'Something Wrong Please Try Again Later'
    };
  }
};

exports.getStockForUser = async (userId) => {
  try {
    console.log(userId)
    const user = await getUsers(userId);
    if (!user) {
      return ({
        status: "fail",
        message: "Some thing Wrong. i Can't Get You Account",
      });
    }

    const stocks = await getStocksUserId({ userId });
    if(!stocks){
      return ({
        status: "fail",
        message: "You don't have any Stocks",
      });
    }
    // console.log(stocks)
    const stocksData = await getPricesData(stocks);
   
    return ({
      status: "success",
      stocksData,
      message:'List Sended'
      // stocks: modifiedStocks,
    });
  } catch (error) {
    console.log(error)
    return ({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

exports.resetAccount = async (userId) => {
  try {
    const user = await getUsers(userId);
    if (!user) {
      return ({
        status: "fail",
        message: "Some thing Wrong. i Can't Get You Account",
      });
    }
    
    await deleteUsersAllStock(userId);

    await updateUserBalance(userId, {
      balance: 10000,
    });

    return ({
      status: "success",
        message: 'Account Reset \n You Balance Is:- 10000',
        balance: 10000,
      }
    );
  } catch (error) {
    console.log(error)
    return ({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};
