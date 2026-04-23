// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract ChainOfCustody {
    enum ActionType {
        Uploaded,
        Verified,
        Transferred,
        Locked,
        Viewed,
        Custom
    }

    struct CustodyEntry {
        address actor;
        string actorRole; // off-chain role label (e.g., registrar, judge)
        ActionType actionType;
        uint256 timestamp;
        string remarks; // optional context
        string signatureHash; // hash of actor's signed payload
    }

    mapping(bytes32 => CustodyEntry[]) private custodyLogs; // evidenceId => logs

    event CustodyEntryLogged(
        bytes32 indexed evidenceId,
        address indexed actor,
        ActionType actionType,
        uint256 timestamp,
        string actorRole,
        string remarks,
        string signatureHash
    );

    function addCustodyEntry(
        bytes32 evidenceId,
        ActionType actionType,
        string calldata actorRole,
        string calldata remarks,
        string calldata signatureHash
    ) external {
        require(evidenceId != bytes32(0), "evidenceId required");
        require(bytes(signatureHash).length > 0, "signatureHash required");

        CustodyEntry memory entry = CustodyEntry({
            actor: msg.sender,
            actorRole: actorRole,
            actionType: actionType,
            timestamp: block.timestamp,
            remarks: remarks,
            signatureHash: signatureHash
        });

        custodyLogs[evidenceId].push(entry);

        emit CustodyEntryLogged(
            evidenceId,
            msg.sender,
            actionType,
            block.timestamp,
            actorRole,
            remarks,
            signatureHash
        );
    }

    function getCustodyLogs(
        bytes32 evidenceId
    ) external view returns (CustodyEntry[] memory) {
        return custodyLogs[evidenceId];
    }

    function getCustodyLogCount(
        bytes32 evidenceId
    ) external view returns (uint256) {
        return custodyLogs[evidenceId].length;
    }
}
