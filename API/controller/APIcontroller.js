"use strict";
const SmartContractDAO = require("../data/SmartContractDAO");
const FloopybirdDAO = require("../data/FloopybirdDAO");
const helper = require("./helper.js");
const dbPath = "./floppyBird.db";
const matchCode = 5;
const floppyBirdDao = new FloopybirdDAO(dbPath);

//get player's token balance 
async function getBalance(address) {
  let dao = new SmartContractDAO();
  return await dao.getBalance(address);
}
//add player's info to the game's database
async function addPlayer(address) {
  try {
    return await floppyBirdDao.AddPlayerVault(address);
  } catch (err) {
    console.log(err);
    return null;
  }
}
//get all active matches
async function getAllActiveMatches() {
  try {
    return await floppyBirdDao.GetAllActiveMatches();
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getAllMatches() {
  try {
    return await floppyBirdDao.GetAllMatches();
  } catch (error) {
    console.log(error);
    return null;
  }
}

//get player's balance in game
async function getTicketBalance(address) {
  try {
    await floppyBirdDao.AddPlayerVault(address);
  } catch { }
  try {
    return await floppyBirdDao.GetPlayerTicketBalance(address);
  } catch (error) {
    console.log(error);
    return null;
  }
}
//add ticket to player
async function addTicketBalanceTo(address, amount, txHash) {
  try {
    return await floppyBirdDao.AddPlayerBalance(address, amount, txHash);
  } catch (error) {
    console.log(`add ticket balance: ` + error);
    return null;
  }
}



//update recorded transaction
async function updateTransaction(id, transid) {
  try {

    let result = await floppyBirdDao.UpdateTransaction(id, transid);

    return result;
  } catch (error) {
    console.log(error);
  }
  return null;
}
//when player start a new match
async function startPlayerMatch(address) {
  try {
    //cost 5 ticket per match
    let code = await floppyBirdDao.WithdrawPlayerBalance(address, matchCode);
    if (code != null) {
      let result = await floppyBirdDao.StartPlayerMatch(address);
      return result;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}
//end the match
async function endPlayerMatch(address, id, point, matchData) {
  try {

    //await dao.AddPlayerVault(address);
    //await dao.AddPlayerBalance(address, amount*2);
    let endMatchId = await floppyBirdDao.EndPlayerMatch(address, id, point, matchData);
    console.log(address, id, point, matchData);
    if (endMatchId != null) {
      let result = await floppyBirdDao.AddPlayerBalance(address, point, null);
      return result;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

//handle add player api request
exports.addNewPlayer = async function addNewPlayer(req, res) {
  try {
    let { address } = req.body;
    console.log(address);
    var rs = await addPlayer(address);
    if (rs == null)
      res.status(401).json(helper.APIReturn(101, "something wrongs"));

    return res
      .status(200)
      .json(helper.APIReturn(0, { balances: rs }, "Success"));
  } catch (err) {
    //return res.status(401).json(helper.APIReturn(101, "something wrongs"));
  }

};




//handle deposit api request
exports.deposit = async function deposit(req, res) {
  try {
    let { address, amount, txHash } = req.body;
    if (address === undefined || amount === undefined || amount === 0 || txHash === undefined) {
      return res.status(400).json(helper.APIReturn(101, "bad request"));
    }
    let bls = await addTicketBalanceTo(address, amount, txHash);


    return res.status(200).json(
      helper.APIReturn(
        0,
        {
          address: address,
          balance: bls
        },
        "success"
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
};

//handle withdraw api request

exports.withdraw = async function withdraw(req, res) {
  try {
    let { address, amount } = req.body;
    console.log(address, amount);
    if (address === undefined || amount === undefined || amount <= 0) {
      return res.status(400).json(helper.APIReturn(101, "bad request"));
    }

    let rs = await floppyBirdDao.WithdrawPlayerBalance(address, amount);
    if (rs == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));

    let smcDAO = new SmartContractDAO();
    let transHash = await smcDAO.withdraw(address, amount);
    //could not execute withdraw transaction
    if (transHash == null || transHash === undefined)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));
    return res.status(200).json(
      helper.APIReturn(
        0,
        {
          to: address,
          amount: amount,
          txHash: transHash,
        },
        "success"
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
};

//handle get in game balance api request
exports.getTicketBalance = async function (req, res) {
  try {
    let { address } = req.body;
    console.log(address);
    if (address === undefined) {
      return res.status(400).json(helper.APIReturn(101, "bad request"));
    }
    let ticketBalance = await getTicketBalance(address);
    if (ticketBalance == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));

    return res.status(200).json(
      helper.APIReturn(
        0,
        {
          ticketBalance: ticketBalance,
        },
        "success"
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
}
//handle get token balance api request

exports.getBalance = async function (req, res) {
  try {
    let { address } = req.body
    var bls = await getBalance(address);
    if (bls == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));
    return res
      .status(200)
      .json(helper.APIReturn(0, { tokenBalances: bls }, "Success"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
}

exports.startMatch = async function (req, res) {
  try {
    let { address } = req.body;
    console.log(address);
    if (address === undefined) {
      return res.status(400).json(helper.APIReturn(101, "bad request"));
    }
    let matchId = await startPlayerMatch(address);
    if (matchId == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));

    return res.status(200).json(
      helper.APIReturn(
        0,
        {
          matchId: matchId,
        },
        "success"
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
}
exports.endMatch = async function (req, res) {
  try {
    let { address, id, point, data } = req.body;
    if (address === undefined || id === undefined) {
      return res.status(400).json(helper.APIReturn(101, "bad request"));
    }
    let rs = await endPlayerMatch(address, id, point, data);
    if (rs == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));

    return res.status(200).json(
      helper.APIReturn(
        0,
        {
          balance: rs,
        },
        "success"
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
}


exports.getAllActiveMatches = async function (req, res) {
  try {
    let activeMatches = await getAllActiveMatches();
    if (activeMatches == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));

    return res.status(200).json(
      helper.APIReturn(
        0,
        {
          activeMatches
        },
        "success"
      )
    );

  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
}



exports.getAllMatches = async function (req, res) {
  try {
    let mathes = await getAllMatches();
    if (mathes == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));

    return res.status(200).json(
      helper.APIReturn(
        0,
        {
          mathes
        },
        "success"
      )
    );

  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "somthing is wrong"));
  }
}








