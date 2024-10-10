import "dotenv/config";
import { abi as uniswapV3SwapRouterABI } from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import { ethers } from "ethers";
import ERC20ABI from "../../abis/ERC20.json";
import { address } from "../../utils/address";

// Arbitrum RPC 노드 연결
const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

// 지갑 생성
const privateKey = process.env.PRIVATE_KEY!;
const wallet = new ethers.Wallet(privateKey, provider);

// 유니스왑 V3 SwapRouter 주소 및 ABI
const swapRouterAddress = address.UniswapV3SwapRouterAddress;

const routerContract = new ethers.Contract(swapRouterAddress, uniswapV3SwapRouterABI, wallet);

// 스왑 파라미터를 객체로 정의
const swapParams = {
  tokenIn: address.WETHAddress, // WETH 주소
  tokenOut: address.USDCAddress, // USDC 주소
  fee: 500, // 0.05% 풀 사용
  recipient: wallet.address, // 스왑 결과를 받을 주소
  deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10분 후 트랜잭션 마감
  amountIn: ethers.parseUnits("0.0005", 18), // 스왑할 WETH
  amountOutMinimum: ethers.parseUnits("0.5", 6), // 최소 USDC 수령
  sqrtPriceLimitX96: 0, // 가격 제한 없음
};

// 토큰 승인을 간단하게 함수로 구현
const approveToken = async (tokenAddress: string, amount: ethers.BigNumberish) => {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);
  const tx = await tokenContract.approve(swapRouterAddress, amount);
  await tx.wait();
  console.log(`${tokenAddress} approved for ${amount}`);
};

// 스왑 함수
const swapWithExactInputSingle = async (params: {
  tokenIn: string;
  tokenOut: string;
  fee: number;
  recipient: string;
  deadline: number;
  amountIn: ethers.BigNumberish;
  amountOutMinimum: ethers.BigNumberish;
  sqrtPriceLimitX96: number;
}) => {
  try {
    // 토큰 승인
    await approveToken(params.tokenIn, params.amountIn);

    // 스왑 트랜잭션 생성 및 실행
    const tx = await routerContract.exactInputSingle(params);
    const receipt = await tx.wait();
    console.log("Swap completed:", receipt);
  } catch (error) {
    console.error("Error during swap:", error);
  }
};

// 스왑 실행
swapWithExactInputSingle(swapParams);
