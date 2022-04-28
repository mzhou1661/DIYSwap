import React, { Component } from "react";

import TokenFactory from "./contracts/DIYERC20Factory.json";
import Factory from "./contracts/DIYFactory.json";
import Router from "./contracts/DIYRouter.json";
import DIYERC20 from "./contracts/DIYERC20.json";
import Pair from "./contracts/DIYPair.json";
import DIYToken from "./contracts/DIYToken.json";
import DIYMaster from "./contracts/DIYMaster.json";

import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { tokenA: 0, tokenB: 0, lpToken: 0, lpTokenPending: 0, pairToken: 0, pairTokenProvided: 0, pairToken2: 0, pairTokenProvided2: 0,
    tokenAReserve: 0, tokenBReserve: 0, exchange: 0,
    tokenAReserve2: 0, tokenLPReserve2: 0, exchange2: 0, exchange3: 0,
    stakingInputA: 0, stakingInputB: 0, unstakingInput: 0, 
    stakingInputA2: 0, stakingInputLP2: 0, unstakingInput2: 0,
    stakingLPInput: 0, stakingLPInput2: 0,
    swappingInputA: 0, swappingInputB: 0, swappingInputA2: 0, swappingInputLP2: 0, swappingInputB3: 0, swappingInputLP3: 0
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();
      this.deployedNetwork = TokenFactory.networks[this.networkId];
      this.tokenFactory = new this.web3.eth.Contract(
        TokenFactory.abi, TokenFactory.networks[this.networkId] && TokenFactory.networks[this.networkId].address,
      );

      this.factory = new this.web3.eth.Contract(
        Factory.abi, Factory.networks[this.networkId] && Factory.networks[this.networkId].address,
      );

      this.router = new this.web3.eth.Contract(
        Router.abi, Router.networks[this.networkId] && Router.networks[this.networkId].address,
      );
      
      const erc201 = await this.tokenFactory.methods.DIYERC20s(0).call();
      const erc202 = await this.tokenFactory.methods.DIYERC20s(1).call();
      this.erc201 = new this.web3.eth.Contract(
        DIYERC20.abi, DIYERC20.networks[this.networkId] && erc201,
      );
      this.erc202 = new this.web3.eth.Contract(
        DIYERC20.abi, DIYERC20.networks[this.networkId] && erc202,
      );
      let balance1 = await this.erc201.methods.balanceOf(this.accounts[0]).call();
      let balance2 = await this.erc202.methods.balanceOf(this.accounts[0]).call();

      const pair = await this.factory.methods.getPair(this.erc201.options.address, this.erc202.options.address).call();
      this.pair = new this.web3.eth.Contract(
        Pair.abi, DIYERC20.networks[this.networkId] && pair,
      );
      let reserves = await this.pair.methods.getReserves().call({ from: this.accounts[0] });
      let ex = reserves[1] / reserves[0];
      let balancePair = await this.pair.methods.balanceOf(this.accounts[0]).call();
      
      this.diyMaster = new this.web3.eth.Contract(
        DIYMaster.abi, DIYMaster.networks[this.networkId] && DIYMaster.networks[this.networkId].address,
      );

      const diyAddress = await this.diyMaster.methods.diyToken().call();

      this.diyToken = new this.web3.eth.Contract(
        DIYToken.abi, DIYERC20.networks[this.networkId] && diyAddress,
      );

      let balanceLP = await this.diyToken.methods.balanceOf(this.accounts[0]).call();
      let balancePendingLP = await this.diyMaster.methods.pendingDIY(0, this.accounts[0]).call();

      const pair2 = await this.factory.methods.getPair(this.erc201.options.address, this.diyToken.options.address).call();
      this.pair2 = new this.web3.eth.Contract(
        Pair.abi, DIYERC20.networks[this.networkId] && pair2,
      );
      let reserves2 = await this.pair2.methods.getReserves().call({ from: this.accounts[0] });
      let ex2 = reserves2[1] / reserves2[0];
      let balancePair2 = await this.pair2.methods.balanceOf(this.accounts[0]).call();

      let balanceProvidedLP = await this.diyMaster.methods.userInfo(0, this.accounts[0]).call();
      let balanceProvidedLP2 = await this.diyMaster.methods.userInfo(1, this.accounts[0]).call();

      let ex3 = ex2 / ex;

      this.setState({ tokenA: balance1, tokenB: balance2, lpToken: balanceLP, lpTokenPending: balancePendingLP, pairToken: balancePair, pairToken2: balancePair2,
        pairTokenProvided: balanceProvidedLP.amount, pairTokenProvided2: balanceProvidedLP2.amount, tokenAReserve: reserves[0], tokenBReserve: reserves[1], exchange: ex,
        tokenAReserve2: reserves2[0], tokenLPReserve2: reserves2[1], exchange2: ex2, exchange3: ex3} );

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  handleSwappingSubmit = async () => {
    if (this.state.swappingInputA > 0 && this.state.swappingInputB === 0) {
      await this.erc201.methods.approve(this.router.options.address, this.state.swappingInputA).send({from: this.accounts[0]});
      await this.router.methods.swapExactTokensForTokens(
        this.state.swappingInputA, 0, [this.erc201.options.address, this.erc202.options.address], this.accounts[0], 0).send({from: this.accounts[0]});
      alert("Swapping from Token A to Token B Submitted");
    } else if (this.state.swappingInputB > 0 && this.state.swappingInputA === 0) {
      await this.erc202.methods.approve(this.router.options.address, this.state.swappingInputB).send({from: this.accounts[0]});
      await this.router.methods.swapExactTokensForTokens(
        this.state.swappingInputB, 0, [this.erc202.options.address, this.erc201.options.address], this.accounts[0], 0).send({from: this.accounts[0]});
      alert("Swapping from Token B to Token A Submitted");
    } else {
      alert("Input Error");
    }
    
  };

  handleSwappingSubmit2 = async () => {
    if (this.state.swappingInputA2 > 0 && this.state.swappingInputLP2 === 0) {
      await this.erc201.methods.approve(this.router.options.address, this.state.swappingInputA2).send({from: this.accounts[0]});
      await this.router.methods.swapExactTokensForTokens(
        this.state.swappingInputA2, 0, [this.erc201.options.address, this.diyToken.options.address], this.accounts[0], 0).send({from: this.accounts[0]});
      alert("Swapping from Token A to Token LP Submitted");
    } else if (this.state.swappingInputLP2 > 0 && this.state.swappingInputA2 === 0) {
      await this.diyToken.methods.approve(this.router.options.address, this.state.swappingInputLP2).send({from: this.accounts[0]});
      await this.router.methods.swapExactTokensForTokens(
        this.state.swappingInputLP2, 0, [this.diyToken.options.address, this.erc201.options.address], this.accounts[0], 0).send({from: this.accounts[0]});
      alert("Swapping from Token LP to Token A Submitted");
    } else {
      alert("Input Error");
    }
    
  };

  handleSwappingSubmit3 = async () => {
    if (this.state.swappingInputB3 > 0 && this.state.swappingInputLP3 === 0) {
      await this.erc202.methods.approve(this.router.options.address, this.state.swappingInputB3).send({from: this.accounts[0]});
      await this.router.methods.swapExactTokensForTokens(
        this.state.swappingInputB3, 0, [this.erc202.options.address, this.erc201.options.address, this.diyToken.options.address], this.accounts[0], 0).send({from: this.accounts[0]});
      alert("Swapping from Token B to Token LP Submitted");
    } else if (this.state.swappingInputLP3 > 0 && this.state.swappingInputB3 === 0) {
      await this.diyToken.methods.approve(this.router.options.address, this.state.swappingInputLP3).send({from: this.accounts[0]});
      await this.router.methods.swapExactTokensForTokens(
        this.state.swappingInputLP3, 0, [this.diyToken.options.address, this.erc201.options.address, this.erc202.options.address], this.accounts[0], 0).send({from: this.accounts[0]});
      alert("Swapping from Token LP to Token B Submitted");
    } else {
      alert("Input Error");
    }
    
  };

  handleStakingSubmit = async () => {
    await this.erc201.methods.approve(this.router.options.address, this.state.stakingInputA).send({from: this.accounts[0]});
    await this.erc202.methods.approve(this.router.options.address, this.state.stakingInputB).send({from: this.accounts[0]});
    await this.router.methods.addLiquidity(
      this.erc201.options.address, this.erc202.options.address, this.state.stakingInputA, this.state.stakingInputB, 0, 0,
      this.accounts[0], 0).send({from: this.accounts[0]});
    alert("Staking Submitted");
  };

  handleUnstakingSubmit = async () => {
    await this.pair.methods.approve(this.router.options.address, this.state.unstakingInput).send({from: this.accounts[0]});
    await this.router.methods.removeLiquidity(
      this.erc201.options.address, this.erc202.options.address, this.state.unstakingInput, 0, 0,
      this.accounts[0], 0).send({from: this.accounts[0]});
    alert("Unstaking Submitted");
  };

  handleStakingSubmit2 = async () => {
    await this.erc201.methods.approve(this.router.options.address, this.state.stakingInputA2).send({from: this.accounts[0]});
    await this.diyToken.methods.approve(this.router.options.address, this.state.stakingInputLP2).send({from: this.accounts[0]});
    await this.router.methods.addLiquidity(
      this.erc201.options.address, this.diyToken.options.address, this.state.stakingInputA2, this.state.stakingInputLP2, 0, 0,
      this.accounts[0], 0).send({from: this.accounts[0]});
    alert("Staking Submitted");
  };

  handleUnstakingSubmit2 = async () => {
    await this.pair2.methods.approve(this.router.options.address, this.state.unstakingInput2).send({from: this.accounts[0]});
    await this.router.methods.removeLiquidity(
      this.erc201.options.address, this.diyToken.options.address, this.state.unstakingInput2, 0, 0,
      this.accounts[0], 0).send({from: this.accounts[0]});
    alert("Unstaking Submitted");
  };

  handleStakingLPSubmit = async () => {
    await this.pair.methods.approve(this.diyMaster.options.address, this.state.stakingLPInput).send({from: this.accounts[0]});
    await this.diyMaster.methods.deposit(0, this.state.stakingLPInput).send({from: this.accounts[0]});
    alert("Staking LP Submitted");
  };

  handleUnstakingLPSubmit = async () => {
    await this.diyMaster.methods.withdraw(0, this.state.stakingLPInput).send({from: this.accounts[0]});
    alert("Unstaking LP Submitted");
  };

  handleStakingLPSubmit2 = async () => {
    await this.pair2.methods.approve(this.diyMaster.options.address, this.state.stakingLPInput2).send({from: this.accounts[0]});
    await this.diyMaster.methods.deposit(1, this.state.stakingLPInput2).send({from: this.accounts[0]});
    alert("Staking LP Submitted");
  };

  handleUnstakingLPSubmit2 = async () => {
    await this.diyMaster.methods.withdraw(1, this.state.stakingLPInput2).send({from: this.accounts[0]});
    alert("Unstaking LP Submitted");
  };

  handleStakingChangeA = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      stakingInputA: value
    });
  };

  handleStakingChangeB = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      stakingInputB: value
    });
  };

  handleStakingChangeA2 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      stakingInputA2: value
    });
  };

  handleStakingChangeLP2 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      stakingInputLP2: value
    });
  };

  handleUnstakingChange = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      unstakingInput: value
    });
  };

  handleUnstakingChange2 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      unstakingInput2: value
    });
  };

  handleSwappingChangeA = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      swappingInputA: value
    });
  };

  handleSwappingChangeB = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      swappingInputB: value
    });
  };

  handleSwappingChangeA2 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      swappingInputA2: value
    });
  };

  handleSwappingChangeLP2 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      swappingInputLP2: value
    });
  };

  handleSwappingChangeB3 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      swappingInputB3: value
    });
  };

  handleSwappingChangeLP3 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      swappingInputLP3: value
    });
  };

  handleStakingLPChange = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      stakingLPInput: value
      
    });
  };

  handleStakingLPChange2 = async (event) => {
    var value = event.target.value;
    value = value > 0 ? value : 0;
    this.setState({
      stakingLPInput2: value
      
    });
  };

  handleUpdate = async () => {
    await this.diyMaster.methods.massUpdatePools().send({from: this.accounts[0]});
    alert("All Pools Updated");
  };

  render() {
    if (!this.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <p><strong>DIYSwap</strong></p>
        <div class="box2">
        <p><strong>Token Information</strong></p>
          <p>Token A Owned: <mark class="blue">{this.state.tokenA}</mark></p>
          <p>Token B Owned: <mark class="blue">{this.state.tokenB}</mark></p>
          <p>Total LP Token Owned: <mark class="blue">{this.state.lpToken}</mark></p>
          <button type="button" class="stakeButton" onClick={this.handleUpdate}>Update All Pools</button>
          </div>

        <div class="box2">
        <p><strong>Swap: Token A | Token B</strong></p>
          <p>Token A: <input type="text" class="tokenA" onChange={this.handleSwappingChangeA} />&nbsp;&nbsp;Reserve A: <mark class="blue">{this.state.tokenAReserve}</mark></p>
          <p>Token B: <input type="text" class="tokenB" onChange={this.handleSwappingChangeB} />&nbsp;&nbsp;Reserve B: <mark class="blue">{this.state.tokenBReserve}</mark></p>
          <button type="button" class="stakeButton" onClick={this.handleSwappingSubmit}>Swap</button>
          <p>Exchange Rate: 1 Token A = <mark class="blue">{this.state.exchange}</mark> Token B</p>
        </div>

        <div class="box2">
        <p><strong>Swap: Token A | Token LP</strong></p>
          <p>Token A: <input type="text" class="tokenA" onChange={this.handleSwappingChangeA2} />&nbsp;&nbsp;Reserve A: <mark class="blue">{this.state.tokenAReserve2}</mark></p>
          <p>Token LP: <input type="text" class="tokenB" onChange={this.handleSwappingChangeLP2} />&nbsp;&nbsp;Reserve LP: <mark class="blue">{this.state.tokenLPReserve2}</mark></p>
          <button type="button" class="stakeButton" onClick={this.handleSwappingSubmit2}>Swap</button>
          <p>Exchange Rate: 1 Token A = <mark class="blue">{this.state.exchange2}</mark> Token LP</p>
        </div>

        <div class="box2">
        <p><strong>Swap: Token B | Token LP (Through Token A)</strong></p>
          <p>Token B: <input type="text" class="tokenA" onChange={this.handleSwappingChangeB3} /></p>
          <p>Token LP: <input type="text" class="tokenB" onChange={this.handleSwappingChangeLP3} /></p>
          <button type="button" class="stakeButton" onClick={this.handleSwappingSubmit3}>Swap</button>
          <p>Exchange Rate: 1 Token B = <mark class="blue">{this.state.exchange3}</mark> Token LP</p>
        </div>

        <div class="box2">
        <p><strong>Add/Remove Liquidity: Token A | Token B</strong></p>
          <p>Token A: <input type="text" class="tokenA" onChange={this.handleStakingChangeA} /></p>
          <p>Token B: <input type="text" class="tokenB" onChange={this.handleStakingChangeB} />
            &nbsp;&nbsp;
            (Token A - Token B): <input type="text" class="tokenA" onChange={this.handleUnstakingChange} /></p>
          <button type="button" class="stakeButton" onClick={this.handleStakingSubmit}>Stake</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button type="button" class="stakeButton" onClick={this.handleUnstakingSubmit}>Unstake</button>
          <p>(Token A - Token B) Liquidity Token Owned: <mark class="blue">{this.state.pairToken}</mark></p>
        </div>

        <div class="box2">
        <p><strong>Add/Remove Liquidity: Token A | Token LP</strong></p>
          <p>Token A: <input type="text" class="tokenA" onChange={this.handleStakingChangeA2} /></p>
          <p>Token LP: <input type="text" class="tokenB" onChange={this.handleStakingChangeLP2} />
            &nbsp;&nbsp;
            (Token A - Token LP): <input type="text" class="tokenA" onChange={this.handleUnstakingChange2} /></p>
          <button type="button" class="stakeButton" onClick={this.handleStakingSubmit2}>Stake</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button type="button" class="stakeButton" onClick={this.handleUnstakingSubmit2}>Unstake</button>
          <p>(Token A - Token LP) Liquidity Token Owned: <mark class="blue">{this.state.pairToken2}</mark></p>
        </div>

        <div class="box3">
        <p><strong>Stake Liquidity to Receive LP Tokens: </strong></p>
          <p>(Token A - Token B): <input type="text" class="tokenA" onChange={this.handleStakingLPChange} /></p>
          <button type="button" class="stakeButton" onClick={this.handleStakingLPSubmit}>Stake</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button type="button" class="stakeButton" onClick={this.handleUnstakingLPSubmit}>Withdraw</button>
          <p>(Token A - Token B) Liquidity Token Provided: <mark class="blue">{this.state.pairTokenProvided}</mark></p>

          <p>(Token A - Token LP): <input type="text" class="tokenA" onChange={this.handleStakingLPChange2} /></p>
          <button type="button" class="stakeButton" onClick={this.handleStakingLPSubmit2}>Stake</button>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <button type="button" class="stakeButton" onClick={this.handleUnstakingLPSubmit2}>Withdraw</button>
          <p>(Token A - Token LP) Liquidity Token Provided: <mark class="blue">{this.state.pairTokenProvided2}</mark></p>

        </div>
      </div>
    );
  }
}

export default App;
