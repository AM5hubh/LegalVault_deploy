// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title Access control and per-case permissions with evidence freeze flags.
contract AccessControl {
    enum Role {
        None,
        Registrar,
        Judge,
        Officer,
        Viewer
    }

    address public admin;
    mapping(address => Role) public roles; // address => role

    mapping(bytes32 => mapping(address => bool)) private caseAccess; // caseId => user => access flag
    mapping(bytes32 => bool) public evidenceFrozen; // evidenceId => frozen flag

    event AdminTransferred(
        address indexed previousAdmin,
        address indexed newAdmin
    );
    event RoleAssigned(
        address indexed account,
        Role role,
        address indexed actor
    );
    event CaseAccessUpdated(
        bytes32 indexed caseId,
        address indexed account,
        bool canAccess,
        address indexed actor
    );
    event EvidenceFrozen(
        bytes32 indexed evidenceId,
        bool frozen,
        address indexed actor
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }

    modifier onlyRegistrarOrJudge() {
        Role r = roles[msg.sender];
        require(r == Role.Registrar || r == Role.Judge, "Registrar/Judge only");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }

    function setRole(address account, Role role) external onlyAdmin {
        require(account != address(0), "Invalid account");
        roles[account] = role;
        emit RoleAssigned(account, role, msg.sender);
    }

    function grantCaseAccess(
        bytes32 caseId,
        address account
    ) external onlyRegistrarOrJudge {
        require(caseId != bytes32(0), "caseId required");
        require(account != address(0), "Invalid account");
        caseAccess[caseId][account] = true;
        emit CaseAccessUpdated(caseId, account, true, msg.sender);
    }

    function revokeCaseAccess(
        bytes32 caseId,
        address account
    ) external onlyRegistrarOrJudge {
        require(caseId != bytes32(0), "caseId required");
        require(account != address(0), "Invalid account");
        caseAccess[caseId][account] = false;
        emit CaseAccessUpdated(caseId, account, false, msg.sender);
    }

    function hasCaseAccess(
        bytes32 caseId,
        address account
    ) external view returns (bool) {
        return caseAccess[caseId][account];
    }

    function freezeEvidence(bytes32 evidenceId) external onlyRegistrarOrJudge {
        require(evidenceId != bytes32(0), "evidenceId required");
        require(!evidenceFrozen[evidenceId], "Already frozen");
        evidenceFrozen[evidenceId] = true;
        emit EvidenceFrozen(evidenceId, true, msg.sender);
    }

    function unfreezeEvidence(
        bytes32 evidenceId
    ) external onlyRegistrarOrJudge {
        require(evidenceId != bytes32(0), "evidenceId required");
        require(evidenceFrozen[evidenceId], "Not frozen");
        evidenceFrozen[evidenceId] = false;
        emit EvidenceFrozen(evidenceId, false, msg.sender);
    }
}
