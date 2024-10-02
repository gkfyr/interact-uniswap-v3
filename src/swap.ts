import "dotenv/config";

import UniswapV3SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";

import { ethers } from "ethers";
import ERC20ABI from "../abis/ERC20.json";
import { address } from "./address";

// Arbitrum RPC 노드 연결
const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

const swapRouterAddress = address.swapRouterAddress;

// 지갑 생성
const privateKey = process.env.PRIVATE_KEY; // 사용자 개인키
const wallet = new ethers.Wallet(privateKey!, provider);

const { abi: uniswapV3SwapRouterABI } = UniswapV3SwapRouterArtifact;
const routerContract = new ethers.Contract(swapRouterAddress, uniswapV3SwapRouterABI, wallet);

const swapWithExactInputSingle = async () => {
  // 스왑할 토큰 정보 (예: WETH -> USDC)
  const tokenIn = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"; // WETH 주소
  const tokenOut = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // USDC 주소
  const fee = 500; // 0.05% 풀 사용
  const recipient = wallet.address; // 스왑 결과를 받을 주소 (보통 사용자 본인의 주소)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10분 후 트랜잭션 마감
  const amountIn = ethers.parseUnits("0.0005", 18); // 스왑할 WETH (단위: 18 decimals)
  const amountOutMinimum = ethers.parseUnits("0.5", 6); // 최소 USDC 수령 (단위: 6 decimals)

  try {
    // 토큰 승인: 먼저 WETH를 유니스왑 V3 Router에 사용하도록 승인
    const tokenInContract = new ethers.Contract(tokenIn, ERC20ABI, wallet);

    const approvalTx = await tokenInContract.approve(swapRouterAddress, amountIn);
    await approvalTx.wait();
    console.log("Token approved");

    // 스왑 트랜잭션 생성
    const swapTx = await routerContract.exactInputSingle({
      tokenIn,
      tokenOut,
      fee,
      recipient,
      deadline,
      amountIn,
      amountOutMinimum,
      sqrtPriceLimitX96: 0, // 가격 제한 없음
    });

    // 트랜잭션 대기
    const receipt = await swapTx.wait();
    console.log("Swap completed: ", receipt);
  } catch (error) {
    console.error("An error occured during swap:", error);
  }
};

swapWithExactInputSingle();
