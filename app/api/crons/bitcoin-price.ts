import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Interface for Bitcoin price response
interface BitcoinPriceResponse {
    bitcoin: {
        usd: number;
    };
}

// Function to fetch Bitcoin price
async function getBitcoinPrice(): Promise<number | null> {
    try {
        const response = await axios.get<BitcoinPriceResponse>(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        return response.data.bitcoin.usd;
    } catch (error) {
        console.error("Error fetching Bitcoin price:", error);
        return null;
    }
}

// Function to send SMS
async function sendSms(price: number): Promise<void> {
    const messageData = {
        text: `Hello Alex, the Bitcoin price is $${price}. You can withdraw now.`,
        type: 0,
        sender: "AGWESTNDC",
        destinations: ["+233553143196"],
    };

    const host = "api.smsonlinegh.com";
    const endPoint = `http://${host}/v5/message/sms/send`;

    try {
        await axios.post(endPoint, messageData, {
            headers: {
                Host: host,
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: "key 57faad0d3a168f4dd78ab9018331d6b0199bf441b530ef3050ec6b01e71691f1",
            },
        });
    } catch (error) {
        console.error("Error sending SMS:", error);
    }
}

// Next.js API Route Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const price = await getBitcoinPrice();

    if (price !== null) {
        if (price > 84500 || price < 84200) {
            await sendSms(price);
            return res.status(200).json({ message: `SMS sent! Bitcoin is $${price}` });
        }
    }

    return res.status(200).json({ message: `No SMS sent. Bitcoin is $${price}` });
}
