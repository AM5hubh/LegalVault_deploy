// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract CaseRegistry {
    enum CaseStatus {
        Open,
        UnderInvestigation,
        InCourt,
        Resolved,
        Closed
    }

    struct CaseMetadata {
        bytes32 caseId; // external UUID provided by caller
        string caseNumber; // human-readable case reference
        CaseStatus status;
        address createdBy; // registrar that created the case
        uint256 timestampCreated;
    }

    address public registrar;
    mapping(address => bool) public judges;
    mapping(bytes32 => CaseMetadata) private cases; // caseId => metadata
    mapping(bytes32 => mapping(string => bool)) private caseAccess; // caseId => email => access flag
    bytes32[] private caseIds; // enumerable list of caseIds

    event CaseCreated(
        bytes32 indexed caseId,
        string caseNumber,
        address indexed registrar,
        uint256 timestamp
    );

    event CaseStatusUpdated(
        bytes32 indexed caseId,
        CaseStatus previousStatus,
        CaseStatus newStatus,
        address indexed actor,
        uint256 timestamp
    );

    event AccessAssigned(
        bytes32 indexed caseId,
        string email,
        bool canAccess,
        address indexed actor,
        uint256 timestamp
    );

    event JudgeUpdated(
        address indexed judge,
        bool isActive,
        address indexed actor
    );

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "Registrar only");
        _;
    }

    modifier onlyRegistrarOrJudge() {
        require(
            msg.sender == registrar || judges[msg.sender],
            "Registrar or judge only"
        );
        _;
    }

    constructor() {
        registrar = msg.sender;
    }

    function setRegistrar(address newRegistrar) external onlyRegistrar {
        require(newRegistrar != address(0), "Invalid registrar");
        registrar = newRegistrar;
    }

    function setJudge(address judge, bool isActive) external onlyRegistrar {
        require(judge != address(0), "Invalid judge");
        judges[judge] = isActive;
        emit JudgeUpdated(judge, isActive, msg.sender);
    }

    function createCase(
        bytes32 caseId,
        string calldata caseNumber,
        string[] calldata initialAccessEmails
    ) external onlyRegistrar {
        require(caseId != bytes32(0), "caseId required");
        require(bytes(caseNumber).length > 0, "caseNumber required");
        require(!exists(caseId), "Case already exists");

        cases[caseId] = CaseMetadata({
            caseId: caseId,
            caseNumber: caseNumber,
            status: CaseStatus.Open,
            createdBy: msg.sender,
            timestampCreated: block.timestamp
        });

        caseIds.push(caseId);

        // Registrar always has access; seed any additional recipients.
        // Seed email access list
        for (uint256 i = 0; i < initialAccessEmails.length; i++) {
            caseAccess[caseId][initialAccessEmails[i]] = true;
        }

        emit CaseCreated(caseId, caseNumber, msg.sender, block.timestamp);
    }

    function updateCaseStatus(
        bytes32 caseId,
        CaseStatus newStatus
    ) external onlyRegistrarOrJudge {
        require(exists(caseId), "Case not found");

        CaseMetadata storage meta = cases[caseId];
        CaseStatus previous = meta.status;
        meta.status = newStatus;

        emit CaseStatusUpdated(
            caseId,
            previous,
            newStatus,
            msg.sender,
            block.timestamp
        );
    }

    function assignAccess(
        bytes32 caseId,
        string calldata email,
        bool canAccess
    ) external onlyRegistrar {
        require(exists(caseId), "Case not found");
        require(bytes(email).length > 0, "Invalid email");

        caseAccess[caseId][email] = canAccess;
        emit AccessAssigned(
            caseId,
            email,
            canAccess,
            msg.sender,
            block.timestamp
        );
    }

    function hasAccess(
        bytes32 caseId,
        string calldata email
    ) external view returns (bool) {
        return caseAccess[caseId][email];
    }

    function getCase(
        bytes32 caseId
    ) external view returns (CaseMetadata memory) {
        require(exists(caseId), "Case not found");
        return cases[caseId];
    }

    function exists(bytes32 caseId) public view returns (bool) {
        return cases[caseId].timestampCreated != 0;
    }

    function getCaseIds() external view returns (bytes32[] memory) {
        return caseIds;
    }

    function getAllCases() external view returns (CaseMetadata[] memory) {
        CaseMetadata[] memory allCases = new CaseMetadata[](caseIds.length);
        for (uint256 i = 0; i < caseIds.length; i++) {
            allCases[i] = cases[caseIds[i]];
        }
        return allCases;
    }
}
