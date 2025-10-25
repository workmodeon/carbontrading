import React, { useState, useMemo, useCallback } from 'react';
import { Leaf, Users, TrendingUp, ExternalLink } from 'lucide-react';

// --- MOCK DATA ---
const initialSellers = [
    { id: 'S1', name: "EcoForest Solutions", capacity: 5000, unitsSold: 1200, price: 15.00, color: "emerald-500" },
    { id: 'S2', name: "Renewable Wind Farm Co.", capacity: 8000, unitsSold: 3500, price: 14.50, color: "sky-500" },
    { id: 'S3', name: "Sustainable Peatland", capacity: 3000, unitsSold: 900, price: 16.20, color: "lime-500" },
];

const initialBuyers = [
    { id: 'B1', name: "TechCorp Global", reductionGoal: 2000, unitsBought: 800, initialCarbon: 10000 },
    { id: 'B2', name: "Manufacturing Hub Inc.", reductionGoal: 5000, unitsBought: 3000, initialCarbon: 50000 },
    { id: 'B3', name: "Logistics Fleet Co.", reductionGoal: 1500, unitsBought: 800, initialCarbon: 8000 },
];

const initialTrades = [
    { id: 1, sellerId: 'S1', buyerId: 'B1', volume: 500, price: 15.00, timestamp: '2025-10-01' },
    { id: 2, sellerId: 'S2', buyerId: 'B2', volume: 1500, price: 14.50, timestamp: '2025-10-05' },
    { id: 3, sellerId: 'S1', buyerId: 'B3', volume: 400, price: 15.00, timestamp: '2025-10-10' },
    { id: 4, sellerId: 'S2', buyerId: 'B2', volume: 2000, price: 14.50, timestamp: '2025-10-15' },
    { id: 5, sellerId: 'S3', buyerId: 'B1', volume: 300, price: 16.20, timestamp: '2025-10-20' },
    { id: 6, sellerId: 'S3', buyerId: 'B3', volume: 500, price: 16.20, timestamp: '2025-10-25' },
];

// Custom Hook to combine data and calculate metrics
const useTradingData = () => {
    const [sellers] = useState(initialSellers);
    const [buyers] = useState(initialBuyers);
    const [trades] = useState(initialTrades);

    const metrics = useMemo(() => {
        const totalVolume = trades.reduce((sum, trade) => sum + trade.volume, 0);
        const totalValue = trades.reduce((sum, trade) => sum + (trade.volume * trade.price), 0);
        const averagePrice = totalValue / totalVolume || 0;
        const totalCapacity = sellers.reduce((sum, s) => sum + s.capacity, 0);
        const capacityUsed = sellers.reduce((sum, s) => sum + s.unitsSold, 0);
        const capacityUtilization = (capacityUsed / totalCapacity) * 100;

        // Calculate green growth percentage for each buyer
        const buyersWithGrowth = buyers.map(buyer => {
            // Aggregate all purchases for this buyer
            const buyerPurchases = trades
                .filter(t => t.buyerId === buyer.id)
                .reduce((sum, t) => sum + t.volume, 0);

            // Green Growth is calculated as % of reduction goal met by purchases
            const growthPercentage = Math.min(100, (buyerPurchases / buyer.reductionGoal) * 100);

            return {
                ...buyer,
                totalPurchases: buyerPurchases,
                growthPercentage: Math.round(growthPercentage),
            };
        });

        // Mapping: who sold to whom
        const sellerBuyerMap = sellers.map(seller => {
            const soldTo = trades
                .filter(t => t.sellerId === seller.id)
                .map(t => buyers.find(b => b.id === t.buyerId).name)
                .filter((v, i, a) => a.indexOf(v) === i); // Unique buyers

            return {
                ...seller,
                soldTo: soldTo,
            };
        });

        return {
            totalVolume,
            totalValue,
            averagePrice,
            capacityUtilization: Math.round(capacityUtilization),
            buyersWithGrowth,
            sellerBuyerMap,
        };
    }, [sellers, buyers, trades]);

    return { sellers, buyers, trades, metrics };
};

// --- Sub Components ---

// MetricCard is unused but retained structure for completeness
const MetricCard = ({ icon: Icon, title, value, unit, color }) => (
    <div className="flex flex-col items-start p-6 bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg border border-emerald-100">
        <Icon className={`w-8 h-8 ${color} mb-3`} />
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="text-3xl font-bold text-gray-800 mt-1">
            {value.toLocaleString()}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </div>
    </div>
);

const RegistrationCard = ({ title, url, description, color }) => (
    // Card styling changed to white background with light border for pastel look
    <div className={`p-6 bg-white rounded-xl shadow-sm border border-emerald-200 flex flex-col items-start transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:ring-1 hover:ring-${color}/50`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title} Registration</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            // Button uses a subtle border and text color
            className={`mt-auto px-4 py-2 text-sm font-medium border border-emerald-500/50 text-emerald-600 rounded-lg hover:bg-emerald-500/10 flex items-center transition-colors shadow-sm`}
            onClick={() => console.log(`Redirecting to ${title} registration form.`)}
        >
            Register Now
            <ExternalLink className="w-4 h-4 ml-2" />
        </a>
    </div>
);

const CapacityDisplay = ({ sellers }) => (
    // Card styling changed to white background with light border
    <div className="col-span-12 lg:col-span-4 p-6 bg-white rounded-xl shadow-sm border border-emerald-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Leaf className="w-5 h-5 text-emerald-500 mr-2" />
            Sellers' Green Capacity
        </h2>
        <div className="space-y-4">
            {sellers.map(seller => (
                <div key={seller.id} className="text-sm">
                    <div className="flex justify-between mb-1 text-gray-600">
                        <span className="font-medium">{seller.name}</span>
                        <span>{seller.unitsSold.toLocaleString()} / {seller.capacity.toLocaleString()} Units</span>
                    </div>
                    {/* Pastel green progress bar fill */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full bg-emerald-400`}
                            style={{ width: `${(seller.unitsSold / seller.capacity) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const BuyerGreenGrowthChart = ({ buyers }) => {
    // Sort buyers by growth percentage for better visual comparison
    const sortedBuyers = [...buyers].sort((a, b) => b.growthPercentage - a.growthPercentage);

    return (
        // Card styling changed to white background with light border
        <div className="col-span-12 lg:col-span-8 p-6 bg-white rounded-xl shadow-sm border border-emerald-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                {/* Emerald icon color */}
                <TrendingUp className="w-5 h-5 text-emerald-500 mr-2" />
                Buyers' Green Growth Status (Goal Met)
            </h2>
            <div className="space-y-6">
                {sortedBuyers.map(buyer => (
                    <div key={buyer.id} className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-600">{buyer.name}</span>
                            {/* Emerald percentage text color */}
                            <span className={`text-base font-bold ${buyer.growthPercentage === 100 ? 'text-green-600' : 'text-emerald-500'}`}>
                                {buyer.growthPercentage}%
                            </span>
                        </div>
                        {/* Bar chart using div styling with light track and pastel fill */}
                        <div className="w-full bg-gray-200 rounded-md h-6 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ease-out ${buyer.growthPercentage === 100 ? 'bg-green-600' : 'bg-emerald-400'}`}
                                style={{ width: `${buyer.growthPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Purchased: {buyer.totalPurchases.toLocaleString()} / Goal: {buyer.reductionGoal.toLocaleString()} units
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const TradingMatrix = ({ sellerBuyerMap }) => (
    // Card styling changed to white background with light border
    <div className="col-span-12 p-6 bg-white rounded-xl shadow-sm border border-emerald-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            {/* Emerald icon color */}
            <Users className="w-5 h-5 text-emerald-500 mr-2" />
            Active Seller-Buyer Mapping
        </h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                {/* Table header is a light pastel green */}
                <thead className="bg-emerald-100/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Seller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Trading With (Buyers)
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {sellerBuyerMap.map((seller, index) => (
                        <tr key={seller.id} className={index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/50 hover:bg-emerald-100 transition-colors'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                {seller.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {seller.soldTo.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {seller.soldTo.map(buyerName => (
                                            // Pastel green badge styling
                                            <span key={buyerName} className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/50">
                                                {buyerName}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-gray-500 italic">No active trades yet.</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


// --- Main App Component ---

const App = () => {
    const { sellers, metrics } = useTradingData();
    const { buyersWithGrowth, sellerBuyerMap } = metrics; 

    return (
        // Main background changed to a very light, subtle emerald green
        <div className="min-h-screen bg-emerald-50 text-gray-800 font-sans p-4 sm:p-8">
            <header className="mb-8 border-b border-emerald-200 pb-4">
                {/* Pastel green for Zissions tag */}
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
                    Product of Zissions
                </p>
                {/* Title gradient using soft green and mint tones */}
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                    CarbonBridge Exchange
                </h1>
                <p className="text-gray-600 mt-1">
                    Decarbonization Trading Platform Metrics Dashboard
                </p>
            </header>

            {/* Registration Section */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Registration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RegistrationCard
                        title="Seller"
                        url="https://forms.gle/1WcFs1boTXogUj2q7"
                        description="Register your carbon-reducing assets and capacity to connect with corporate buyers."
                        color="emerald-500"
                    />
                    <RegistrationCard
                        title="Buyer"
                        url="https://forms.gle/B3CgMaibptdmDXzBA"
                        description="Submit your decarbonization goals and start purchasing carbon credits instantly."
                        color="sky-500"
                    />
                </div>
            </section>

            {/* Mapping and Capacity/Growth Visualizations */}
            <section className="mb-10">
                <div className="grid grid-cols-12 gap-6">
                    {/* Bar Chart: Buyer Green Growth */}
                    <BuyerGreenGrowthChart buyers={buyersWithGrowth} />

                    {/* Seller Green Capacity Display */}
                    <CapacityDisplay sellers={sellers} />

                    {/* Mapping Table */}
                    <TradingMatrix sellerBuyerMap={sellerBuyerMap} />
                </div>
            </section>

            <footer className="mt-10 pt-4 border-t border-emerald-200 text-center text-sm text-gray-500">
                CarbonBridge Exchange | Real-time Data Simulation (Mock Data) | Powered by Zissions
            </footer>
        </div>
    );
};

export default App;