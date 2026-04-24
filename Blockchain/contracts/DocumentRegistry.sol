// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract DocumentRegistry {
    struct Document {
        string cid; // IPFS CID
        string fileHash; // e.g., SHA-256 of the file
        address uploader;
        uint256 timestamp;
    }

    event DocumentRegistered(
        bytes32 indexed docId,
        string cid,
        string fileHash,
        address indexed uploader,
        uint256 timestamp
    );

    mapping(bytes32 => Document) private documents;

    function registerDocument(
        string calldata cid,
        string calldata fileHash
    ) external returns (bytes32 docId) {
        require(bytes(cid).length > 0, "CID required");
        require(bytes(fileHash).length > 0, "Hash required");

        docId = keccak256(
            abi.encodePacked(cid, fileHash, msg.sender, block.timestamp)
        );
        require(bytes(documents[docId].cid).length == 0, "Already exists");

        documents[docId] = Document({
            cid: cid,
            fileHash: fileHash,
            uploader: msg.sender,
            timestamp: block.timestamp
        });

        emit DocumentRegistered(
            docId,
            cid,
            fileHash,
            msg.sender,
            block.timestamp
        );
    }

    function getDocument(
        bytes32 docId
    ) external view returns (Document memory) {
        require(bytes(documents[docId].cid).length != 0, "Not found");
        return documents[docId];
    }

    function exists(bytes32 docId) external view returns (bool) {
        return bytes(documents[docId].cid).length != 0;
    }
}
