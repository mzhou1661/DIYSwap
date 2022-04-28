// SPDX-License-Identifier: GPL-3.0
pragma solidity >0.7.0 <0.9.0;

import './DIYERC20.sol';

contract DIYERC20Factory {
    DIYERC20[] public DIYERC20s;
    event NewDIYERC();

    function createERC() external {
        DIYERC20s.push(new DIYERC20());
        emit NewDIYERC();
    }
}
