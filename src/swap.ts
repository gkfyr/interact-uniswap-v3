import "dotenv/config";
import { ethers } from "ethers";
import UniswapV3SwapRouterArtifact from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import ERC20ABI from "../abis/ERC20.json";
import { address } from "./address";
// 유니스왑 V3 Router 주소 (Arbitrum)
const swapRouterAddress = address.swapRouterAddress;

// Uniswap V3 Router의 ABI (swapExactInputSingle 함수)
const { abi: uniswapV3SwapRouterABI } = UniswapV3SwapRouterArtifact;

async function swapTokens() {
  // RPC 노드 연결
  const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

  // 사용자의 지갑
  const privateKey = "YOUR_PRIVATE_KEY"; // 사용자 개인키
  const wallet = new ethers.Wallet(privateKey, provider);

  // 유니스왑 V3 Router 컨트랙트 객체 생성
  const routerContract = new ethers.Contract(swapRouterAddress, uniswapV3SwapRouterABI, wallet);

  // 스왑할 토큰 정보 (예: WETH -> USDC)
  const tokenIn = ""; // WETH 주소
  const tokenOut = ""; // USDC 주소
  const fee = 3000; // 0.3% 풀 사용
  const recipient = wallet.address; // 스왑 결과를 받을 주소 (보통 사용자 본인의 주소)
  const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10분 후 트랜잭션 마감
  const amountIn = ethers.parseUnits("0.1", 18); // 스왑할 0.1 WETH (단위: 18 decimals)
  const amountOutMinimum = ethers.parseUnits("1", 6); // 최소 1 USDC 수령 (단위: 6 decimals)

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
}

swapTokens();
