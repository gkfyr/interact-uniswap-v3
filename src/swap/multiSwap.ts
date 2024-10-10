import "dotenv/config";
import { abi as uniswapV3SwapRouterABI } from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json";
import { ethers } from "ethers";
import ERC20ABI from "../../abis/ERC20.json";
import { address } from "../../utils/address";
import { MAX_INT_256 } from "../../utils/constants";

// Arbitrum RPC 노드 연결
const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

// 지갑 생성
const privateKey = process.env.PRIVATE_KEY!;
const signer = new ethers.Wallet(privateKey, provider);

// 유니스왑 V3 SwapRouter 주소 및 ABI
const routerContract = new ethers.Contract(address.UniswapV3SwapRouterAddress, uniswapV3SwapRouterABI, signer);

const WETHAddress = address.WETHAddress;
const DAIAddress = address.DAIAddress;
const USDCAddress = address.USDCAddress;

const ETHDAIPoolFee = 3000; // 0.3%
const DAIUSDCPoolFee = 100; // 0.01%

const path = ethers.concat([
  USDCAddress, // USDC 주소 (20 bytes)
  ethers.toBeHex(DAIUSDCPoolFee, 3), // USDC -> DAI 풀 수수료 (3 bytes)
  DAIAddress, // DAI 주소 (20 bytes)
  ethers.toBeHex(ETHDAIPoolFee, 3), // DAI -> WETH 풀 수수료 (3 bytes)
  WETHAddress, // WETH 주소 (20 bytes)
]);

// 스왑 파라미터를 객체로 정의
const swapParams = {
  path,
  recipient: signer.address, // 스왑 결과를 받을 주소
  deadline: Math.floor(Date.now() / 1000) + 60 * 10, // 10분 후 트랜잭션 마감
  amountIn: ethers.parseUnits("1", 6), // 스왑할 WETH
  amountOutMinimum: ethers.parseUnits("0", 18), // 최소 USDC 수령
};

const approveToken = async (tokenIn: string, amountIn: ethers.BigNumberish, signer: ethers.Wallet) => {
  const tokenInContract = new ethers.Contract(tokenIn, ERC20ABI, signer);
  const approvalTx = await tokenInContract.approve(address.UniswapV3SwapRouterAddress, amountIn);
  await approvalTx.wait();
  console.log("Token approved");
};

const swapWithExactInput = async (params: {
  path: string;
  recipient: string;
  deadline: number;
  amountIn: ethers.BigNumberish;
  amountOutMinimum: ethers.BigNumberish;
}) => {
  try {
    // 토큰 승인: 먼저 WETH를 유니스왑 V3 Router에 사용하도록 승인
    await approveToken(WETHAddress, MAX_INT_256, signer);

    // 스왑 트랜잭션 생성
    const swapTx = await routerContract.exactInput(params);

    // 트랜잭션 대기
    const receipt = await swapTx.wait();
    console.log("Swap completed: ", receipt);
  } catch (error) {
    console.error("An error occured during swap:", error);
  }
};

// 스왑 실행
swapWithExactInput(swapParams);
