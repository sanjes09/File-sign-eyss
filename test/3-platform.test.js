const Vesting = artifacts.require("Vesting");
const Platform = artifacts.require("Platform");
const XCB = artifacts.require("XCB");

const {
  BN,
  time,
  expectEvent,
  expectRevert,
  constants: { ZERO_ADDRESS },
} = require("@openzeppelin/test-helpers");

const { expect } = require("chai");
require("chai").use(require("chai-bn")(BN));

const toWei = (value) => web3.utils.toWei(String(value));

contract("Platform", ([owner, team, alice, bob, random]) => {
  let vesting, xcb, platform;

  before(async function () {

    vesting = await Vesting.new(50, 20, 4, 10, 10, 3, 3);

    xcb = await XCB.new("CryptoBirdToken", "XCB");
    await xcb.setVestingContract(vesting.address, toWei(500000));

    platform = await Platform.new(xcb.address, team);
  });
  
  it("Should have 500.000XCB", async () => {
    let balance = await xcb.balanceOf(vesting.address);
    expect(balance).to.be.bignumber.equal(toWei(500000));
  })

  it("Should start vesting", async () => {
    const tx = await vesting.startVesting(
      xcb.address, //token address
      platform.address, // platform address
      120,  // months for platform vesting, DESIRED 120
      random, // ifo address
      random, // pool address
      random, // developers address
      365, // days for tokens lock
      12, // months for developers vesting, DESIRED 12
      random, // investo address
      random // partner address
    )
    await platform.setVestingContract(vesting.address);

    expect(tx.logs[0].event === "started");
  })

  it("Should not claim platform vested tokens at start", async () => {
    await expectRevert(
      platform.getTokens(),
      "Vesting no available yet"
    )
  })

  it("Should not let make distribution without previous vesting", async () => {
    let addresses = [alice,bob];
    let amounts = [toWei(1000),toWei(1000)];
    await expectRevert(
      platform.makeDistribution(addresses, amounts),
      "Already distributed this month"
    )
  })

  it("Should claim platform vested tokens after 30 days", async () => {
    await time.increase(time.duration.days(30));
    let prevBalance = await xcb.balanceOf(platform.address);
    await platform.getTokens();
    let postBalance = await xcb.balanceOf(platform.address);
    expect(Number(postBalance)).to.gt(Number(prevBalance));
  })

  it("Should not claim platform vested tokens for at least 30 more days", async () => {
    await expectRevert(
      platform.getTokens(),
      "Vesting no available yet"
    )
  })

  it("Should make distribution", async () => {
    let addresses = [alice,bob];
    let amounts = [toWei(1000),toWei(1000)];
    let tx = await platform.makeDistribution(addresses, amounts);
    expectEvent(tx, "Distribution", {
      addressCount: "2",
      totalAmount: toWei(2000),
    });
  })

  it("Should not let make distribution after already distributed", async () => {
    let addresses = [alice,bob];
    let amounts = [toWei(1000),toWei(1000)];
    await expectRevert(
      platform.makeDistribution(addresses, amounts),
      "Already distributed this month"
    )
  })

  it("Should claim platform vested tokens after another 30 days", async () => {
    await time.increase(time.duration.days(30));
    let prevBalance = await xcb.balanceOf(platform.address);
    await platform.getTokens();
    let postBalance = await xcb.balanceOf(platform.address);
    expect(Number(postBalance)).to.gt(Number(prevBalance));
  })

  it("Should make distribution to team address after 5 days after vesting", async () => {
    await time.increase(time.duration.days(5));
    let addresses = [alice,bob];
    let amounts = [toWei(1000),toWei(1000)];
    let tx = await platform.makeDistribution(addresses, amounts);
    expectEvent(tx, "DistributionToTeam", {
      totalAmount: await vesting.platform_tokens_permonth(),
    });
  })

  it("Should claim reward", async () => {
    let prevBalance = await xcb.balanceOf(alice);
    let tx = await platform.claimReward({from: alice});
    let postBalance = await xcb.balanceOf(alice);
    expect(Number(postBalance)).to.gt(Number(prevBalance));
    expectEvent(tx, "TokensClaimed", {
      user: alice,
      totalAmount: toWei(1000)
    });
  })

  it("Should claim platform vested tokens and make distribution for 4 months", async () => {
    for (let i = 0; i < 4; i++) {

      await time.increase(time.duration.days(30));
      let prevBalance = await xcb.balanceOf(platform.address);
      await platform.getTokens();
      let postBalance = await xcb.balanceOf(platform.address);
      expect(Number(postBalance)).to.gt(Number(prevBalance));
  
      let addresses = [alice,bob];
      let amounts = [toWei(1000),toWei(1000)];
      let tx = await platform.makeDistribution(addresses, amounts);
      expectEvent(tx, "Distribution", {
        addressCount: "2",
        totalAmount: toWei(2000),
      });

    }
  })

  it("Should claim only 3 rewards (1 lost because of delay 3 months)", async () => {
    let prevBalance = await xcb.balanceOf(alice);
    let tx = await platform.claimReward({from: alice});
    let postBalance = await xcb.balanceOf(alice);
    expect(Number(postBalance)).to.gt(Number(prevBalance));
    expectEvent(tx, "TokensClaimed", {
      user: alice,
      totalAmount: toWei(3000)
    });
  })

  it("Should borrow tokens unclaimed", async () => {
    let prevBalance = await xcb.balanceOf(random);
    await platform.borrowTokens(random, {from: owner});
    let postBalance = await xcb.balanceOf(random);
    expect(Number(postBalance)).to.gt(Number(prevBalance));
  })

});
