const db = require('../db-manager');

exports.purchaseStock = async({ userId, ticker, quantity, current }) =>{
    try {
        const sql = `insert into users_stocks (ticker, price, quantity, order_type, user_id) values (:ticker, :current::text, :quantity, 'buy', :userId) returning id;`;
        const { records } = await db.query(sql,{userId, ticker, quantity, current})
        return records[0] || null
    } catch (error) {
        console.log(error)
        return null;
    }
}

exports.getStockById = async({ userId, stockId}) =>{
    try {
        const sql = `select * from users_stocks where user_id = :userId and id = :stockId::int;`;
        const { records } = await db.query(sql,{userId, stockId})
        return records[0] || null
    } catch (error) {
        return null;
    }
}

exports.getStockTickersByUserId = async({ userId }) =>{
    try {
        const sql = `select * from users_stocks where user_id = :userId`;
        const { records } = await db.query(sql,{userId})
        return records[0] || null
    } catch (error) {
        return null;
    }
}

exports.getStocksUserId = async({ userId }) =>{
    try {
        const sql = `select * from users_stocks where user_id = :userId`;
        const { records } = await db.query(sql,{userId})
        return records || null
    } catch (error) {
        return null;
    }
}

exports.deleteStockById = async(stockId, userId) =>{
    try {
        const sql = `delete from users_stocks where user_id = :userId and id = :stockId::int;`;
        await db.query(sql,{userId, stockId})
        return true
    } catch (error) {
        console.log(error)
        return null;
    }
}

exports.updateStock = async(stockId, {quantity}) =>{
    try {
        console.log(stockId, quantity, '*****')
        const sql = `update users_stocks set quantity = :quantity where id = :stockId::int;`;
        await db.query(sql,{quantity, stockId})
        return true
    } catch (error) {
        return null;
    }
}

exports.deleteUsersAllStock = async(userId) =>{
    try {
        const sql = `delete from users_stocks where user_id = :userId`;
        await db.query(sql,{userId})
        return true
    } catch (error) {
        return null;
    }
}