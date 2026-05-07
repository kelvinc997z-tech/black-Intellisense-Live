// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TradeEscrow {
    enum TradeStatus { REQUESTED, GUARANTEED, EXECUTED, SETTLED, CANCELLED }

    struct Trade {
        address partner;
        uint256 amount;
        string asset;
        TradeStatus status;
        bool isZkVerified;
        uint256 createdAt;
    }

    mapping(string => Trade) public trades;
    address public admin;

    event TradeInitiated(string tradeId, address partner);
    event TradeGuaranteed(string tradeId);
    event TradeExecuted(string tradeId);
    event TradeSettled(string tradeId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function initiateTrade(string memory _tradeId, address _partner, uint256 _amount, string memory _asset) public onlyAdmin {
        trades[_tradeId] = Trade({
            partner: _partner,
            amount: _amount,
            asset: _asset,
            status: TradeStatus.REQUESTED,
            isZkVerified: false,
            createdAt: block.timestamp
        });
        emit TradeInitiated(_tradeId, _partner);
    }

    function lockTrade(string memory _tradeId) public onlyAdmin {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.REQUESTED, "Trade not in requested state");
        
        trade.status = TradeStatus.GUARANTEED;
        trade.isZkVerified = true;
        
        emit TradeGuaranteed(_tradeId);
    }

    function executeTrade(string memory _tradeId) public onlyAdmin {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.GUARANTEED, "Trade must be guaranteed by ZK proof first");
        
        trade.status = TradeStatus.EXECUTED;
        emit TradeExecuted(_tradeId);
    }

    function releaseAssets(string memory _tradeId) public onlyAdmin {
        Trade storage trade = trades[_tradeId];
        require(trade.status == TradeStatus.EXECUTED, "Trade must be executed before settlement");
        
        trade.status = TradeStatus.SETTLED;
        emit TradeSettled(_tradeId);
    }

    function getTradeStatus(string memory _tradeId) public view returns (TradeStatus) {
        return trades[_tradeId].status;
    }
}
