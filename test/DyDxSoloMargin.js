const BN = require('bn.js');
const { DAI, DAI_WHALE, USDC, USDC_WHALE, USDT, USDT_WHALE } = require('./config');

const IERC20 = artifacts.require('IERC20');
const DyDxSoloMargin = artifacts.require('DyDxSoloMargin');

const sendEther = (web3, from, to, amount) => {
  return web3.eth.sendTransaction({
    from,
    to,
    value: web3.utils.toWei(amount.toString(), 'ether')
  });
};

const cast = (x) => {
  if (x instanceof BN) {
    return x;
  }
  return new BN(x);
};

const pow = (x, y) => {
  x = cast(x);
  y = cast(y);
  return x.pow(y);
};

contract('DyDxSoloMargin', (accounts) => {
  const WHALE = USDC_WHALE;
  const TOKEN = USDC;
  const DECIMALS = 6;
  const FUND_AMOUNT = pow(10, DECIMALS).mul(new BN(2000000));
  const BORROW_AMOUNT = pow(10, DECIMALS).mul(new BN(1000000));

  let DyDxSoloMargin;
  let token;

  beforeEach(async () => {
    token = await IERC20.at(TOKEN);
    DyDxSoloMargin = await DyDxSoloMargin.new();

    await sendEther(web3, accounts[0], WHALE, 1);

    // send enough token to cover fee
    const bal = await token.balanceOf(WHALE);
    assert(bal.gte(FUND_AMOUNT), 'balance < fund');
    await token.transfer(DyDxSoloMargin.address, FUND_AMOUNT, { from: WHALE });

    const soloBal = await token.balanceOf(SOLO);
    console.log(`solo balance: ${soloBal}`);
    assert(soloBal.gte(BORROW_AMOUNT), 'solo < borrow');
  });

  it('flash loan', async () => {
    const tx = await DyDxSoloMargin.initiateFlashLoan(token.address, BORROW_AMOUNT, {
      from: WHALE
    });

    console.log(`${await DyDxSoloMargin.flashUser()}`);

    for (const log of tx.logs) {
      console.log(log.args.message, log.args.val.toString());
    }
  });
});
