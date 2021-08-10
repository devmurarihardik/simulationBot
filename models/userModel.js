const db = require('../db-manager');

exports.getUsers = async (userId) =>{
  try {
    const { records } = await db.query('select * from user_account where user_id = :userId',{userId})
    if(records && records.length > 0){
      return records[0]
    }
    return null;
  } catch (error) {
    return null;
  }
}

exports.updateUserBalance = async (userId, balance) =>{
  try {
    await db.query('update user_account set balance = :balance where user_id = :userId',{userId, balance})
    return true;
  } catch (error) {
    return null;
  }
}

exports.addUserAccount = async (userId) =>{
  try {
    const { records } = await db.query('insert into user_account (user_id) values (:userId) returning * ',{userId})
    if(records && records.length > 0){
      return records[0]
    }
    return null;
  } catch (error) {
    return null;
  }
}