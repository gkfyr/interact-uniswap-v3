import "dotenv/config";
import { ethers } from "ethers";
import { abi as QuoterABI } from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { address } from "../../utils/address";

// RPC 및 Quoter 계약 주소 설정
const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");
const quoterAddress = address.UniswapV3QuoterAddress; // 유니스왑 V3 Quoter 주소

const quoterContract = new ethers.Contract(quoterAddress, QuoterABI, provider);

const WETHAddress = address.WETHAddress;
const USDCAddress = address.USDCAddress;

// 견적을 위한 함수 호출
async function getQuoteExactInputSingle() {
  const amountInETH = "1"; // 1 ETH
  const amountIn = ethers.parseUnits(amountInETH, 18);

  try {
    const quotedAmountOut = await quoterContract.getFunction("quoteExactInputSingle").staticCall(
      WETHAddress, // WETH 주소
      USDCAddress, // USDC 주소
      500, // 0.05% 수수료 풀
      amountIn, // 스왑할 ETH 양
      0 // 가격 제한 없음
    );
    const quotedAmountOutETH = ethers.formatUnits(quotedAmountOut, 6);
    console.log(`Put ${amountInETH} ETH => Get ${quotedAmountOutETH} USDC`);
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
}

getQuoteExactInputSingle();

async function getQuoteExactOutputSingle() {
  const amountOutETH = "100"; // 100 USDC
  const amountOut = ethers.parseUnits(amountOutETH, 6);

  try {
    const quotedAmountIn = await quoterContract.getFunction("quoteExactOutputSingle").staticCall(
      WETHAddress, // WETH 주소
      USDCAddress, // USDC 주소
      500, // 0.05% 수수료 풀
      amountOut, // 받을 USDC 양
      0 // 가격 제한 없음
    );

    const quotedAmountInETH = ethers.formatUnits(quotedAmountIn);
    console.log(`To get ${amountOutETH} USDC => Put ${quotedAmountInETH} ETH`);
  } catch (error) {
    console.error("Error fetching quote:", error);
  }
}

getQuoteExactOutputSingle();
