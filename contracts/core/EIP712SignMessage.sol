// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

contract EIP712SignMessage is EIP712{
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

    mapping(address => mapping(uint256 => bool)) private isNonceUsed;

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
        bytes32 messageHash = getLenderMessageHash(data);
        return
            SignatureChecker.isValidSignatureNow(
                data.lenderAddress,
                messageHash,
                signature
            );
    }

    function _markNonceAsUsed(address user, uint256 nonce) internal returns (bool) {
        require(!isNonceUsed[user][nonce], "Nonce already used");
        isNonceUsed[user][nonce] = true;
        return true;
    }

    function _isNonceUsed(address user, uint256 nonce) internal view returns (bool) {
        return isNonceUsed[user][nonce];
    }

}
