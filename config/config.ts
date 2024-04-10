import dotenv from "dotenv";
dotenv.config();

try {
  dotenv.config();
} catch (error) {
  console.error("Error loading environment variables:", error);
  process.exit(1);
}

export const MONGO_URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
export const PORT = process.env.PORT
export const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET";
export const RBYAmount = Number(process.env.RBY_AMOUNT)
export const treasuryPrivKey = process.env.TREASURY_PRIVATE_KEY!.toString()
export const tokenMint = process.env.TOKEN_ADDR!.toString()
export const solanaNet = process.env.SOLANA_NET;
export const rpcURL = process.env.RPC_URL!;
export const fee = Number(process.env.FEE!);
export const total_angle = Number(process.env.ANGLE);