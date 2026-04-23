// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface ICaseRegistry {
    function exists(bytes32 caseId) external view returns (bool);
    function registrar() external view returns (address);
    function judges(address judge) external view returns (bool);
}

contract EvidenceRegistry {
    struct Evidence {
        string ipfsCID;
        string fileHash;
        string evidenceType;
        address uploader;
        uint256 timestamp;
    }

    ICaseRegistry public caseRegistry;
    mapping(bytes32 => Evidence[]) private caseEvidence; // caseId => evidence list
    mapping(bytes32 => bool) public frozen; // caseId => frozen flag
    bytes32[] private casesWithEvidence; // track caseIds that have at least one evidence
    mapping(bytes32 => bool) private hasEvidenceEntry; // de-dup caseIds in casesWithEvidence

    event EvidenceAdded(
        bytes32 indexed caseId,
        string ipfsCID,
        string fileHash,
        string evidenceType,
        address indexed uploader,
        uint256 timestamp
    );

    event EvidenceFrozen(
        bytes32 indexed caseId,
        address indexed actor,
        uint256 timestamp
    );

    modifier onlyRegistrarOrJudge() {
        require(
            msg.sender == caseRegistry.registrar() ||
                caseRegistry.judges(msg.sender),
            "Registrar or judge only"
        );
        _;
    }

    constructor(address caseRegistryAddress) {
        require(caseRegistryAddress != address(0), "CaseRegistry required");
        caseRegistry = ICaseRegistry(caseRegistryAddress);
    }

    function addEvidence(
        bytes32 caseId,
        string calldata ipfsCID,
        string calldata fileHash,
        string calldata evidenceType
    ) external {
        require(caseRegistry.exists(caseId), "Case not found");
        require(!frozen[caseId], "Case evidence frozen");
        require(bytes(ipfsCID).length > 0, "ipfsCID required");
        require(bytes(fileHash).length > 0, "fileHash required");
        require(bytes(evidenceType).length > 0, "evidenceType required");

        Evidence memory ev = Evidence({
            ipfsCID: ipfsCID,
            fileHash: fileHash,
            evidenceType: evidenceType,
            uploader: msg.sender,
            timestamp: block.timestamp
        });
        caseEvidence[caseId].push(ev);

        if (!hasEvidenceEntry[caseId]) {
            hasEvidenceEntry[caseId] = true;
            casesWithEvidence.push(caseId);
        }

        emit EvidenceAdded(
            caseId,
            ipfsCID,
            fileHash,
            evidenceType,
            msg.sender,
            block.timestamp
        );
    }

    function freezeEvidence(bytes32 caseId) external onlyRegistrarOrJudge {
        require(caseRegistry.exists(caseId), "Case not found");
        require(!frozen[caseId], "Already frozen");

        frozen[caseId] = true;
        emit EvidenceFrozen(caseId, msg.sender, block.timestamp);
    }

    function getEvidence(
        bytes32 caseId
    ) external view returns (Evidence[] memory) {
        return caseEvidence[caseId];
    }

    // Returns all caseIds that have evidence along with their evidence lists
    function getAllEvidence()
        external
        view
        returns (bytes32[] memory caseIds, Evidence[][] memory evidences)
    {
        uint256 len = casesWithEvidence.length;
        caseIds = casesWithEvidence;
        evidences = new Evidence[][](len);

        for (uint256 i = 0; i < len; i++) {
            Evidence[] storage stored = caseEvidence[caseIds[i]];
            uint256 evLen = stored.length;
            Evidence[] memory copied = new Evidence[](evLen);
            for (uint256 j = 0; j < evLen; j++) {
                copied[j] = stored[j];
            }
            evidences[i] = copied;
        }
    }
}
