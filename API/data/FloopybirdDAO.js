const sqlite3 = require('sqlite3');
const CommandStore = require("./SqlCommandStore")
const sqlCommandStore = new CommandStore.SqlCommandStore();

class FloopybirdDAO {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.log("Could not connect to database", err);
            }
            else {
                console.log("Connected to database", this.db);
            }
        });
    }


    async RunCommand(sqlQuery, params) {
        console.log(sqlQuery);
        return new Promise((resolve, reject) => {
            this.db.all(sqlQuery, params, (err, result) => {
                if (err) {
                    console.log("Something went wrong with sql query:" + sqlQuery);
                    reject(err);
                } else {
                    //console.log("SQL query result: " + result);
                    resolve(result);
                }
            })
        })
    }

    async AddPlayerVault(wallet_id) {

        let date = parseInt(new Date().getTime() / 1000);
        let rs = await this.RunCommand(sqlCommandStore.AddPlayerVaultCommand, {
            $wallet_id: wallet_id,
            $created_date: date,
        });
        console.log(rs);
        return rs[0].balance;
    }


    async AddPlayerBalanceTransaction(wallet_id, transaction_type, amount, transaction_date, transaction_id) {
        let rs = await this.RunCommand(sqlCommandStore.AddPlayerBalanceTransactionCommand, {
            $wallet_id: wallet_id,
            $transaction_type: transaction_type,
            $amount: amount,
            $transaction_date: transaction_date,
            $transaction_id: transaction_id,
        });

        if (rs == null || rs.length == 0) return null;
        return rs[0].id;
    }


    async GetPlayerTicketBalance(wallet_id) {
        let rs = await this.RunCommand(sqlCommandStore.GetPlayerBalanceCommand, {
            $wallet_id: wallet_id,
        });
        if (rs == null || rs.length == 0) return null;
        return rs[0].balance;
    }

    async AddPlayerBalance(wallet_id, amount, txHash) {
        let date = parseInt(new Date().getTime() / 1000);

        let rs = await this.RunCommand(sqlCommandStore.AddPlayerBalanceCommand, {
            $wallet_id: wallet_id,
            $amount: amount,
        })
        if (rs == null || rs.length == 0) return null;

        this.AddPlayerBalanceTransaction(wallet_id, 1, amount, date, txHash);
        return rs[0].balance;
    }

    async WithdrawPlayerBalance(wallet_id, amount) {
        let date = parseInt(new Date().getTime() / 1000);
        let rs = await this.RunCommand(sqlCommandStore.WithdrawPlayerBalanceCommand, {
            $wallet_id: wallet_id,
            $amount: amount,
        })
        console.log(rs);
        if (rs == null || rs.length == 0) return null;

        this.AddPlayerBalanceTransaction(wallet_id, 2, amount, date, null);
        return rs[0].balance;
    }

    async StartPlayerMatch(wallet_id) {
        let start_time = parseInt(new Date().getTime() / 1000);
        let rs = await this.RunCommand(sqlCommandStore.StartPlayerMatchCommand, {
            $wallet_id: wallet_id,
            $start_time: start_time,
        })
        if (rs == null || rs.length == 0) return null;
        return rs[0].id;
    }

    async EndPlayerMatch(wallet_id, id, player_point, play_data = "") {
        let end_time = parseInt(new Date().getTime() / 1000);
        let rs = await this.RunCommand(sqlCommandStore.EndPlayerMatchCommand, {
            $wallet_id: wallet_id,
            $id: id,
            $player_point: player_point,
            $play_data: JSON.stringify(play_data),
            $end_time: end_time,
        })

        console.log(rs);
        if (rs == null || rs.length == 0) return null;
        return rs[0].id;
    }

    async UpdateTransaction(id, transid) {
        await this.RunCommand(cStoreCommand.UpdateTransactionCommand, {
            $id: id,
            $transid: transid,
        });
    }

    async GetAllActiveMatches() {
        let rs = await this.RunCommand(sqlCommandStore.GetAllActiveMatch);
        return rs;
    }

    async GetAllMatches() {
        let rs = await this.RunCommand(sqlCommandStore.GetAllMatches);
        return rs;
    }
}
module.exports = FloopybirdDAO;
