require("dotenv").config();
const { Web3, HttpProvider, eth } = require("web3");
const floppyABI = require("../contracts/floppy.json");
const vaultABI = require("../contracts/vault.json");

class SmartContractDAO {
  constructor() {
    this.web3 = new Web3(
      new HttpProvider("https://data-seed-prebsc-1-s1.binance.org:8545/")
    );
    this.token_address = process.env.FLOPPY_ADDR;
    this.vault_address = process.env.VAULT_ADDR;
    this.withdrawer_privkey = process.env.WITHDRAWER_PRIV_KEY;
    this.withdrawer_address = process.env.WITHDRAWER_ADDR;
  }
  //MTK balance of the address
  async getBalance(address) {
    try {
      const floppy_contract = await new this.web3.eth.Contract(
        floppyABI,
        this.token_address,
      );

      console.log(address);
      var rs = await floppy_contract.methods.balanceOf(address).call();
      var value = Web3.utils.fromWei(rs, 'ether')
      return value;
    } catch (error) {
      console.log(error);

      return null;
    }
  }

  async withdraw(address, amount) {
    await this.web3.eth.accounts.wallet.add(this.withdrawer_privkey);
    const vault_contract = new this.web3.eth.Contract(
      vaultABI,
      this.vault_address
    );
    console.log(amount, address);
    let value = this.web3.utils.toWei(amount.toString(), "wei");
    var rs = await vault_contract.methods
      .withdraw(value, address)
      .send({ from: this.withdrawer_address, gasPrice: 300000000000 });

    console.log(rs);
    return rs.transactionHash;
  }
}

module.exports = SmartContractDAO;
