// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool) ;
}

contract Swap {
    // Keeping exchange rate as 1:1 for simplicity
    function swap(address fromToken, uint256 amount, address toToken) external {
        bool transferred = IERC20(fromToken).transferFrom(msg.sender, address(this), amount);
        require(transferred, "Transfer failed");
        IERC20(toToken).transfer(msg.sender, amount);
    }
}
