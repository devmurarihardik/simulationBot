const { getUsers, addUserAccount } = require("../models/userModel")

exports.getUserBalance = async(userId) =>{
    const response = await getUsers(userId);
    if(!response){
        //add user account entry
        const addUser = await addUserAccount(userId);
        console.log(addUser)
        return {
            message:`Your Balance :- ${addUser.balance}`
        };
    }
    return {
        message:`Your Balance :- ${response.balance}`
    };
}