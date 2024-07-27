// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract EIP712SignMessage is EIP712, Nonces {
    string private constant SIGNING_DOMAIN = "LendmeFi";
    string private constant SIGNATURE_VERSION = "1";

    struct BorrowerData {
        address borrowerAddress;
        uint256 borrowerNonce;
        address nftCollateralAddress;
        uint256 nftTokenId;
        address loanTokenAddress;
        uint256 loanAmount;
        uint256 repaymentAmount;
        uint256 loanDuration;
    }

    struct LenderData {
        address lenderAddress;
        uint256 lenderNonce;
        address nftCollateralAddress;
        uint256 nftTokenId;
        address loanTokenAddress;
        uint256 loanAmount;
        uint256 repaymentAmount;
        uint256 loanDuration;
    }

    event NonceUsed(address indexed user, uint256 nonce);

    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    function getBorrowerMessageHash(
        BorrowerData memory data
    ) public view returns (bytes32) {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "BorrowerData(address borrowerAddress,uint256 borrowerNonce,address nftCollateralAddress,uint256 nftTokenId,address loanTokenAddress,uint256 loanAmount,uint256 repaymentAmount,uint256 loanDuration)"
                        ),
                        data.borrowerAddress,
                        data.borrowerNonce,
                        data.nftCollateralAddress,
                        data.nftTokenId,
                        data.loanTokenAddress,
                        data.loanAmount,
                        data.repaymentAmount,
                        data.loanDuration
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
                            "LenderData(address lenderAddress,uint256 lenderNonce,address nftCollateralAddress,uint256 nftTokenId,address loanTokenAddress,uint256 loanAmount,uint256 repaymentAmount,uint256 loanDuration)"
                        ),
                        data.lenderAddress,
                        data.lenderNonce,
                        data.nftCollateralAddress,
                        data.nftTokenId,
                        data.loanTokenAddress,
                        data.loanAmount,
                        data.repaymentAmount,
                        data.loanDuration
                    )
                )
            );
    }

    function verifyBorrowerSignature(
        BorrowerData memory data,
        bytes memory signature
    ) public view returns (bool) {
        require(
            data.borrowerNonce == nonces(data.borrowerAddress),
            "Invalid nonce"
        );
        bytes32 messageHash = getBorrowerMessageHash(data);
        return
            SignatureChecker.isValidSignatureNow(
                data.borrowerAddress,
                messageHash,
                signature
            );
    }

    function verifyLenderSignature(
        LenderData memory data,
        bytes memory signature
    ) public view returns (bool) {
        require(
            data.lenderNonce == nonces(data.lenderAddress),
            "Invalid nonce"
        );
        bytes32 messageHash = getLenderMessageHash(data);
        return
            SignatureChecker.isValidSignatureNow(
                data.lenderAddress,
                messageHash,
                signature
            );
    }

    function executeBorrowerTransaction(
        BorrowerData memory data,
        bytes memory signature
    ) public {
        require(verifyBorrowerSignature(data, signature), "Invalid signature");
        emit NonceUsed(data.borrowerAddress, data.borrowerNonce);
        _useNonce(data.borrowerAddress);
    }

    function executeLenderTransaction(
        LenderData memory data,
        bytes memory signature
    ) public {
        require(verifyLenderSignature(data, signature), "Invalid signature");
        emit NonceUsed(data.lenderAddress, data.lenderNonce);
        _useNonce(data.lenderAddress);
    }

    function nonces(address owner) public view override returns (uint256) {
        return super.nonces(owner);
    }

    function _useNonce(address owner) internal override returns (uint256) {
        return super._useNonce(owner);
    }
}
