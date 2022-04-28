var TokenFactory = artifacts.require("./DIYERC20Factory.sol");
var Factory = artifacts.require("./DIYFactory.sol");
var Router = artifacts.require("./DIYRouter.sol");
var ERC20 = artifacts.require("./DIYERC20.sol");
var Pair = artifacts.require("./DIYPair.sol");
var DIYToken = artifacts.require("./DIYToken.sol");
var DIYMaster = artifacts.require("./DIYMaster.sol");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TokenFactory);
  tokenFactory = await TokenFactory.deployed();
  await tokenFactory.createERC();
  await tokenFactory.createERC();
  token1Address = await tokenFactory.DIYERC20s(0);
  token2Address = await tokenFactory.DIYERC20s(1);
  factory = await deployer.deploy(Factory, accounts[0]);
  router = await deployer.deploy(Router, factory.address, token1Address);

  pairResult = await factory.createPair(token1Address, token2Address);
  pairAddress = pairResult.logs[0].args.pair;
  pair = await Pair.at(pairAddress);
  
  token1 = await ERC20.at(token1Address);
  await token1._mint(accounts[0], 1000000);
  await token1.approve(router.address, 1000000, {from: accounts[0]});

  token2 = await ERC20.at(token2Address);
  await token2._mint(accounts[0], 1000000);
  await token2.approve(router.address, 1000000, {from: accounts[0]});

  await router.addLiquidity(token1Address, token2Address, 1000000, 1000000, 500000, 500000, accounts[0], 0, {from: accounts[0]})

  await token1._mint(accounts[1], 10000);
  // await token1.approve(router.address, 10000, {from: accounts[1]}); 
  // await router.swapExactTokensForTokens(10000, 0, [token1Address, token2Address], accounts[1], 0, {from: accounts[1]});

  // await token2.approve(router.address, 9881, {from: accounts[1]}); 
  // await router.swapExactTokensForTokens(9881, 0, [token2Address, token1Address], accounts[1], 0, {from: accounts[1]});

  // result = await pair.balanceOf(accounts[0]);
  // reserves = await pair.getReserves();
  // console.log(result);
  // console.log(reserves);
  
  // await pair.approve(router.address, 999000, {from: accounts[0]}); 
  // await router.removeLiquidity(token1Address, token2Address, 999000, 0, 0, accounts[0], 0);

  // result = await pair.balanceOf(accounts[0]);
  // reserves = await pair.getReserves();
  // console.log(result);
  // console.log(reserves);

  master = await deployer.deploy(DIYMaster, 1000, 0, {from: accounts[0]});
  await master.add(1000, pair.address, 1, {from: accounts[0]});

  // await pair.approve(master.address, 999000, {from: accounts[0]});
  // await master.deposit(0, 900000, {from: accounts[0]});

  // await master.deposit(0, 1000, {from: accounts[0]});
  // await master.deposit(0, 1000, {from: accounts[0]});
  // await master.deposit(0, 1000, {from: accounts[0]});
  // await master.deposit(0, 1000, {from: accounts[0]});
  // await master.deposit(0, 1000, {from: accounts[0]});

  // function timeout(ms) {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }
  // await timeout(2000);

  // await master.massUpdatePools();

  // await master.withdraw(0, 900000, {from: accounts[0]});

  diyAddress = await master.diyToken();
  diyToken = await DIYToken.at(diyAddress);
  // result = await diyToken.balanceOf(accounts[0]);
  // console.log(result);

  pairResult2 = await factory.createPair(token1Address, diyAddress);
  pairAddress2 = pairResult2.logs[0].args.pair;
  pair2 = await Pair.at(pairAddress2);

  await master.add(5000, pair2.address, 1, {from: accounts[0]});

  await token1._mint(accounts[0], 1000000);
  await token1.approve(router.address, 1000000, {from: accounts[0]});
  await diyToken.mint(accounts[0], 1000000);
  await diyToken.approve(router.address, 1000000, {from: accounts[0]});

  await router.addLiquidity(token1Address, diyAddress, 1000000, 1000000, 500000, 500000, accounts[0], 0, {from: accounts[0]})

  // result = await pair2.balanceOf(accounts[0]);
  // reserves = await pair2.getReserves();
  // console.log(result);
  // console.log(reserves);

};
