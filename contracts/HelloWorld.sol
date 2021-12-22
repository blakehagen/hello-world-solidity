//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HelloWorld is Ownable {
    string private message;

    constructor() {
        message = "Hello, world!";
    }

    function getMessage() public view returns (string memory) {
        return message;
    }

    function setMessage(string memory _message) public payable {
        require(msg.value >= 0.01 ether, "Changing the message requires at least 0.01 ether");
        message = _message;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function transferBalance(address payable _recipient) public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0 ether, "No balance to transfer");
        (bool sent, ) = _recipient.call{value: balance}("");
        require(sent, "Failed to send Ether");
    }
}
