import { ethers } from "ethers";
import UniswapV3PoolArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import UniswapV3FactoryArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Factory.sol/IUniswapV3Factory.json";
import ERC20ABI from "../abis/ERC20.json";

// Arbitrum RPC 노드 연결
const provider = new ethers.JsonRpcProvider("https://arb1.arbitrum.io/rpc");

// 유니스왑 V3 풀 컨트랙트 주소 ETH / USDC
const poolAddress = "0xC6962004f452bE9203591991D15f6b388e09E8D0";
const factoryAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

const { abi: UniswapV3PoolABI } = UniswapV3PoolArtifact;
const { abi: UniswapV3FactoryABI } = UniswapV3FactoryArtifact;

// 유니스왑 풀 컨트랙트 객체 생성
const poolContract = new ethers.Contract(poolAddress, UniswapV3PoolABI, provider);
const factoryContract = new ethers.Contract(factoryAddress, UniswapV3FactoryABI, provider);

const getPoolInfo = async () => {
  const slot0 = await poolContract.slot0();
  const token0 = await poolContract.token0();
  const token1 = await poolContract.token1();

  const token0Contract = new ethers.Contract(token0, ERC20ABI, provider);
  const token1Contract = new ethers.Contract(token1, ERC20ABI, provider);

  const token0Decimals = Number(await token0Contract.decimals());
  const token1Decimals = Number(await token1Contract.decimals());

  const sqrtPriceX96 = Number(slot0.sqrtPriceX96);

  return { sqrtPriceX96, token0Decimals, token1Decimals };
};

const getPoolPrice = async () => {
  try {
    const { sqrtPriceX96, token0Decimals, token1Decimals } = await getPoolInfo();
    console.log(calculatePriceFromSqrtPriceX96(sqrtPriceX96, token0Decimals, token1Decimals));
  } catch (error) {
    console.error("Error fetching pool price:", error);
  }
};

const calculatePriceFromSqrtPriceX96 = (
  sqrtPriceX96: number,
  token0Decimals: number,
  token1Decimals: number
): number => {
  // sqrtPriceX96을 사용하여 가격을 계산
  const price = (sqrtPriceX96 / 2 ** 96) ** 2;

  // 토큰의 소수 자릿수를 고려한 가격 조정
  return price * 10 ** (token0Decimals - token1Decimals);
};

getPoolPrice();
