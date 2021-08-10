const { getUsers, updateUserBalance } = require("../models/userModel");
const { purchaseStock, getStockById, deleteStockById, updateStock, getUserStocks, getStockByUserId, deleteUsersAllStock } = require("../models/stockModel");
const Axios = require("axios");

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
      message: `StockId: ${purchase.id} \n You Balance Is:- ${Math.round((user.balance - totalPrice + Number.EPSILON) * 100) / 100}`,
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

exports.sellStock = async (req, res) => {
  try {
    const { userId, stockId, quantity, price } = req.body;

    const stock = await getStockById(stockId, userId);

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

    if (quantity > stock.quantity) {
      return ({
        status: "fail",
        message: "Invalid quantity.",
      });
    }

    if (quantity === stock.quantity) {
      await deleteStockById(stockId, userId);
    } else {
      await updateStock(stockId, {
        quantity: stock.quantity - quantity,
      });
    }

    const saleProfit = quantity * price;

    const updatedUser = await updateUserBalance(userId, {
      balance:
        Math.round((user.balance + saleProfit + Number.EPSILON) * 100) / 100,
    });

    return ({
      status: "success",
      balance: Math.round((user.balance + saleProfit + Number.EPSILON) * 100) / 100,
      message: `Stock Sold! \n  You Balance Is:- ${Math.round((user.balance + saleProfit + Number.EPSILON) * 100) / 100}`
    });
  } catch (error) {
    return ({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

const getPricesData = async (stocks) => {
  try {
    const promises = stocks.map(async (stock) => {
      const url = `https://api.tiingo.com/tiingo/daily/${stock.ticker}/prices?token=ba251cbeb5737945420015d75ceedf5f83fbfbfb`;
      const response = await Axios.get(url);
      return {
        ticker: stock.ticker,
        date: response.data[0].date,
        adjClose: response.data[0].adjClose,
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

exports.getStockForUser = async (req, res) => {
  try {
    const user = await getUsers(userId);
    if (!user) {
      return ({
        status: "fail",
        message: "Some thing Wrong. i Can't Get You Account",
      });
    }

    const stocks = await getStockByUserId({ userId: req.params.userId });
    const stocksData = await getPricesData(stocks);
    const modifiedStocks = stocks.map((stock) => {
      // NOTE: need know how to pass the user stock list with current market price 

      // let name;
      // let currentPrice;
      // let currentDate;
      // data.stockData.forEach((stockData) => {
      //   if (stockData.ticker.toLowerCase() === stock.ticker.toLowerCase()) {
      //     name = stockData.name;
      //   }
      // });

      // stocksData.forEach((stockData) => {
      //   if (stockData.ticker.toLowerCase() === stock.ticker.toLowerCase()) {
      //     currentDate = stockData.date;
      //     currentPrice = stockData.adjClose;
      //   }
      // });

      return {
        id: stock._id,
        ticker: stock.ticker,
        name,
        purchasePrice: stock.price,
        purchaseDate: stock.date,
        quantity: stock.quantity,
        currentDate,
        currentPrice,
      };
    });

    return ({
      status: "success",
      stocks: modifiedStocks,
    });
  } catch (error) {
    return ({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};

exports.resetAccount = async (req, res) => {
  try {
    const user = await getUsers(userId);
    if (!user) {
      return ({
        status: "fail",
        message: "Some thing Wrong. i Can't Get You Account",
      });
    }
    
    await deleteUsersAllStock(req.params.userId);

    const updatedUser = await updateUserBalance(req.params.userId, {
      balance: 100000,
    });

    return ({
      status: "success",
      user: {
        username: updatedUser.username,
        id: updatedUser._id,
        message: 'Account Reset \n You Balance Is:- 100000',
        balance: 100000,
      },
    });
  } catch (error) {
    return ({
      status: "fail",
      message: "Something unexpected happened.",
    });
  }
};
