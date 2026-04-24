// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IDocumentRegistry {
    function exists(bytes32 docId) external view returns (bool);
}

contract DocumentAuditTrail {
    enum Action {
        Uploaded,
        Viewed,
        Downloaded,
        Verified,
        Deleted,
        Custom
    }

    struct AuditEvent {
        bytes32 docId;
        Action action;
        address actor;
        uint256 timestamp;
        string details; // optional context
    }

    event AuditLogged(
        bytes32 indexed docId,
        Action action,
        address indexed actor,
        uint256 timestamp,
        string details
    );

    IDocumentRegistry public registry;
    mapping(bytes32 => AuditEvent[]) private auditLog; // docId => events

    constructor(address registryAddress) {
        require(registryAddress != address(0), "Registry required");
        registry = IDocumentRegistry(registryAddress);
    }

    function logEvent(
        bytes32 docId,
        Action action,
        string calldata details
    ) external {
        require(registry.exists(docId), "Doc not registered");

        AuditEvent memory evt = AuditEvent({
            docId: docId,
            action: action,
            actor: msg.sender,
            timestamp: block.timestamp,
            details: details
        });
        auditLog[docId].push(evt);

        emit AuditLogged(docId, action, msg.sender, block.timestamp, details);
    }

    function getEvents(
        bytes32 docId
    ) external view returns (AuditEvent[] memory) {
        return auditLog[docId];
    }

    function getEventsCount(bytes32 docId) external view returns (uint256) {
        return auditLog[docId].length;
    }
}
