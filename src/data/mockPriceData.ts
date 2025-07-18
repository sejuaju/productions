import { CandlestickData, UTCTimestamp } from 'lightweight-charts';



const generateMasterData = (startDate: Date, endDate: Date): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let lastClose = 0.00000050;
    const oneMinuteInSeconds = 60;
    
    let currentTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(endDate.getTime() / 1000);

    while (currentTime < endTime) {
        const open = lastClose;

        const volatility = Math.random() * 0.025;
        const largeSwingChance = Math.random();
        let swing = 0;
        if (largeSwingChance > 0.98) {
            swing = (Math.random() - 0.5) * 0.2;
        }
        
        const high = open * (1 + volatility + swing / 2);
        const low = open * (1 - volatility - swing / 2);
        const close = low + Math.random() * (high - low);
        lastClose = close;

        data.push({ 
            time: currentTime as UTCTimestamp, 
            open, 
            high, 
            low, 
            close 
        });
        
        currentTime += oneMinuteInSeconds;
    }
    return data;
};



const aggregateData = (data: CandlestickData[], intervalInMinutes: number): CandlestickData[] => {
    if (intervalInMinutes <= 1) return data;

    const aggregatedData: CandlestickData[] = [];
    const pointsPerInterval = intervalInMinutes;

    for (let i = 0; i < data.length; i += pointsPerInterval) {
        const chunk = data.slice(i, i + pointsPerInterval);
        if (chunk.length === 0) continue;

        const first = chunk[0];
        const last = chunk[chunk.length - 1];

        const high = Math.max(...chunk.map(d => d.high));
        const low = Math.min(...chunk.map(d => d.low));

        aggregatedData.push({
            time: first.time,
            open: first.open,
            high: high,
            low: low,
            close: last.close,
        });
    }
    return aggregatedData;
};





const currentYear = new Date().getFullYear();
const masterStartDate = new Date(`${currentYear}-06-04T00:00:00Z`);
const masterEndDate = new Date(`${currentYear}-07-09T23:59:59Z`);


const masterData1m = generateMasterData(masterStartDate, masterEndDate);


export const data1m = masterData1m;
export const data5m = aggregateData(masterData1m, 5);
export const data15m = aggregateData(masterData1m, 15);
export const data30m = aggregateData(masterData1m, 30);
export const data1h = aggregateData(masterData1m, 60);
export const data4h = aggregateData(masterData1m, 240);
export const data1d = aggregateData(masterData1m, 1440);
export const data1w = aggregateData(masterData1m, 10080);


export const data1mo = aggregateData(masterData1m, 43200); 