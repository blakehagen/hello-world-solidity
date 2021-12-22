const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { solidity } = require("ethereum-waffle");
use(solidity);

describe("HelloWorld", function () {
  let helloWorldContract;
  let owner, addr1, addr2, addr3;
  let provider;

  beforeEach(async () => {
    const HelloWorld = await ethers.getContractFactory("HelloWorld");
    helloWorldContract = await HelloWorld.deploy();
    await helloWorldContract.deployed();

    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    provider = ethers.provider;
  });

  it("Should return original message after being deployed", async function () {
    expect(await helloWorldContract.getMessage()).to.equal("Hello, world!");
  });

  it("Has owner", async () => {
    let contractOwner = await helloWorldContract.owner();
    expect(contractOwner).to.equal(owner.address);
  });

  it("Should revert when calling setMessage with 0 ether", async function () {
    await expectRevert(
      helloWorldContract.connect(addr1)
      .setMessage(
        "This is my new message!"), "Changing the message requires at least 0.01 ether"
      );
  });

  it("Should revert when calling setMessage with less than 0.01 ether", async function () {
    await expectRevert(
      helloWorldContract.connect(addr1)
      .setMessage("This is my new message!", { value: ethers.utils.parseEther("0.005") }),
      "Changing the message requires at least 0.01 ether"
    );
  });

  it("Should update message correctly and contract should have balance of 0.01 ether", async function () {
    expect(await helloWorldContract.getMessage()).to.equal("Hello, world!");

    const setMessageTx = await helloWorldContract.connect(addr1).setMessage("bh was here!", { value: ethers.utils.parseEther("0.01") });
    await setMessageTx.wait();

    expect(await helloWorldContract.getMessage()).to.equal("bh was here!");
    expect(await helloWorldContract.getBalance()).to.equal(ethers.utils.parseEther("0.01"));
  });

  it("Should check contact balance after being deployed", async function () {
    expect(await helloWorldContract.getBalance()).to.equal(0);
  });

  it("Should revert when calling transferBalance when there is no balance", async function () {
    await expectRevert(
      helloWorldContract.transferBalance(addr1.address),
      "No balance to transfer"
    );
  });

  it("Should revert transferBalance if not called by owner", async function () {
    const setMessageTx = await helloWorldContract.setMessage("hi!", { value: ethers.utils.parseEther("0.01") });
    await setMessageTx.wait();

    await expectRevert(
      helloWorldContract.connect(addr2).transferBalance(addr2.address),
      "Ownable: caller is not the owner"
    );
  });

  it("Should transferBalance successfully", async function () {
    const setMessageTx = await helloWorldContract.setMessage("hi again!", { value: ethers.utils.parseEther("3") });
    await setMessageTx.wait();

    const contractBalanceBefore = await helloWorldContract.getBalance();
    const receiverBalanceBefore = await provider.getBalance(addr1.address);

    const transferBalanceTx = await helloWorldContract.transferBalance(addr1.address);
    await transferBalanceTx.wait();

    expect(await helloWorldContract.getBalance()).to.equal(0);
    expect(await provider.getBalance(addr1.address)).to.equal(contractBalanceBefore.add(receiverBalanceBefore));
  });
});
