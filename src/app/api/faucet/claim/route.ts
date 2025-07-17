import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { RPC_CONFIG, CAPTCHA_CONFIG, FAUCET_CONFIG, REDIS_CONFIG } from '../../../../utils/config';

// --- Konfigurasi Redis untuk Rate Limiting ---
const redis = new Redis({
  url: REDIS_CONFIG.URL,
  token: REDIS_CONFIG.TOKEN,
});

// --- Konfigurasi Faucet ---
const FAUCET_WALLET_PRIVATE_KEY = FAUCET_CONFIG.PRIVATE_KEY;
const EXATECH_L2_RPC_URL = RPC_CONFIG.EXATECH; 
const AMOUNT_TO_SEND = '0.1'; // Jumlah tEXT yang akan dikirim (dalam ether)
const IP_RATE_LIMIT_SECONDS = 60 * 60 * 24; // 24 jam

// --- Konfigurasi Persyaratan Kepemilikan Token ---
const REQUIRE_TOKEN_HOLDING = true; // Set ke `true` untuk mengaktifkan pengecekan
const HOLDING_CHECK_RPC_URL = RPC_CONFIG.BSC_HOLDING_CHECK;
const REQUIRED_TOKEN_ADDRESS = '0x76135c9822da57bb3b18b71fe14b2fdc03ee807f';
const REQUIRED_TOKEN_SYMBOL = 'extV2'; // Ganti dengan simbol token Anda
const MINIMUM_HOLDING_AMOUNT = '1'; // Jumlah minimum yang harus dimiliki (dalam unit token, bukan wei)

const ERC20_ABI_MINIMAL = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

if (!FAUCET_WALLET_PRIVATE_KEY) {
  throw new Error("FAUCET_PRIVATE_KEY is not set in environment variables. Faucet will not work.");
}

// Hapus atau komentari rate limiter lama yang berbasis memori
// const claimTimestamps: Record<string, number> = {};

const exatechProvider = new ethers.JsonRpcProvider(EXATECH_L2_RPC_URL);
const faucetWallet = new ethers.Wallet(FAUCET_WALLET_PRIVATE_KEY, exatechProvider);

async function verifyHCaptcha(token: string) {
  const secretKey = CAPTCHA_CONFIG.SECRET_KEY;
  if (!secretKey) {
    console.error("HCAPTCHA_SECRET_KEY is not set.");
    return false;
  }

  const response = await fetch(CAPTCHA_CONFIG.VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `response=${token}&secret=${secretKey}`,
  });

  const data = await response.json();
  return data.success;
}

export async function POST(request: NextRequest) {
  // --- Langkah -1: Verifikasi hCaptcha ---
  const { address: recipientAddress, hCaptchaToken } = await request.json();

  if (!hCaptchaToken) {
    return NextResponse.json({ message: 'Captcha verification is required.' }, { status: 400 });
  }

  const isHuman = await verifyHCaptcha(hCaptchaToken);
  if (!isHuman) {
    return NextResponse.json({ message: 'Captcha verification failed. Please try again.' }, { status: 403 });
  }

  // --- Langkah 0: Ambil dan Cek Alamat IP ---
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  
  try {
    // Cek apakah IP sudah di-rate limit di Redis dan dapatkan sisa waktu
    const rateLimitKey = `faucet_ip:${ip}`;
    const remainingTime = await redis.ttl(rateLimitKey);

    if (remainingTime > 0) {
      const hours = Math.floor(remainingTime / 3600);
      const minutes = Math.round((remainingTime % 3600) / 60);

      const timeParts = [];
      if (hours > 0) {
        timeParts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
      }
      if (minutes > 0) {
        timeParts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
      }

      let timeLeftMessage;
      if (timeParts.length === 0) {
        timeLeftMessage = 'less than a minute';
      } else {
        timeLeftMessage = timeParts.join(' and ');
      }

      return NextResponse.json(
        {
          message: `You have already claimed tokens recently. Please try again in approximately ${timeLeftMessage}.`,
        },
        { status: 429 }
      );
    }

    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      return NextResponse.json({ message: 'Invalid recipient address.' }, { status: 400 });
    }

    // --- Langkah 1: Cek Persyaratan Kepemilikan Token (jika diaktifkan) ---
    if (REQUIRE_TOKEN_HOLDING) {
      try {
        const holdingProvider = new ethers.JsonRpcProvider(HOLDING_CHECK_RPC_URL);
        const tokenContract = new ethers.Contract(REQUIRED_TOKEN_ADDRESS, ERC20_ABI_MINIMAL, holdingProvider);
        
        const [balance, decimals] = await Promise.all([
          tokenContract.balanceOf(recipientAddress),
          tokenContract.decimals()
        ]);
        
        const formattedBalance = parseFloat(ethers.formatUnits(balance, decimals));
        const minimumAmount = parseFloat(MINIMUM_HOLDING_AMOUNT);

        if (formattedBalance < minimumAmount) {
          return NextResponse.json({ 
            message: `Insufficient balance. You must hold at least ${MINIMUM_HOLDING_AMOUNT} ${REQUIRED_TOKEN_SYMBOL} on BSC Mainnet to use this faucet.` 
          }, { status: 403 }); // 403 Forbidden
        }
      } catch (checkError) {
        console.error('Error checking token holding:', checkError);
        return NextResponse.json({ message: 'Could not verify token holding. Please try again later.' }, { status: 500 });
      }
    }

    // --- Langkah 2: Cek Rate Limiter LAMA SUDAH DIHAPUS ---
    
    // --- Langkah 3: Cek Saldo Faucet ---
    const faucetBalance = await exatechProvider.getBalance(faucetWallet.address);
    const amountToSendWei = ethers.parseEther(AMOUNT_TO_SEND);

    if (faucetBalance < amountToSendWei) {
      console.error('Faucet wallet has insufficient funds.');
      return NextResponse.json({ message: 'Faucet is currently out of funds. Please try again later.' }, { status: 503 });
    }

    // --- Langkah 4: Kirim Transaksi ---
    const tx = await faucetWallet.sendTransaction({
      to: recipientAddress,
      value: amountToSendWei,
    });

    console.log(`Sending ${AMOUNT_TO_SEND} tEXT to ${recipientAddress}, Tx: ${tx.hash}`);
    await tx.wait();
    console.log(`Transaction confirmed: ${tx.hash}`);

    // --- Update Rate Limiter di Redis ---
    await redis.set(rateLimitKey, "claimed", { ex: IP_RATE_LIMIT_SECONDS });
    
    return NextResponse.json({ 
      message: `Successfully sent ${AMOUNT_TO_SEND} tEXT to your address.`,
      txHash: tx.hash
    });

  } catch (error) {
    console.error('Faucet Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ message: 'Failed to process request.', error: errorMessage }, { status: 500 });
  }
} 