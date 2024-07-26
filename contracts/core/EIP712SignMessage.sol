// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract EIP712SignMessage is EIP712, Nonces {
    string private constant SIGNING_DOMAIN = "LendmeFi";
    string private constant SIGNATURE_VERSION = "1";

    struct BorrowerData {
        address borrower;
        uint256 tokenId;
        uint256 amount;
        uint256 nonce;
    }

    struct LenderData {
        address lender;
        uint256 tokenId;
        uint256 amount;
        uint256 nonce;
    }

    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    function getBorrowerMessageHash(
        BorrowerData memory data
    ) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "BorrowerData(address borrower,uint256 tokenId,uint256 amount,uint256 nonce)"
                        ),
                        data.borrower,
                        data.tokenId,
                        data.amount,
                        data.nonce
                    )
                )
            );
    }

    function getLenderMessageHash(
        LenderData memory data
    ) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "LenderData(address lender,uint256 tokenId,uint256 amount,uint256 nonce)"
                        ),
                        data.lender,
                        data.tokenId,
                        data.amount,
                        data.nonce
                    )
                )
            );
    }

    function isValidBorrowerSignature(
        BorrowerData memory data,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = getBorrowerMessageHash(data);
        return
            SignatureChecker.isValidSignatureNow(
                data.borrower,
                messageHash,
                signature
            );
    }

    function isValidLenderSignature(
        LenderData memory data,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = getLenderMessageHash(data);
        return
            SignatureChecker.isValidSignatureNow(
                data.lender,
                messageHash,
                signature
            );
    }

    function executeBorrowerTransaction(
        BorrowerData memory data,
        bytes memory signature
    ) public {
        require(isValidBorrowerSignature(data, signature), "Invalid signature");
        _useNonce(data.borrower);
    }

    function executeLenderTransaction(
        LenderData memory data,
        bytes memory signature
    ) public {
        require(isValidLenderSignature(data, signature), "Invalid signature");
        _useNonce(data.lender);
    }

    function nonces(address owner) public view override returns (uint256) {
        return super.nonces(owner);
    }

    function _useNonce(address owner) internal override returns (uint256) {
        return super._useNonce(owner);
    }
}
