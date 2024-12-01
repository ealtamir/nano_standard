export default function NanoInfo() {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <img 
          src="/nano-logo-blue-dark-blue.png" 
          alt="Nano Logo" 
          style={{ height: '40px' }}
        />
      </div>
      
      <p className="text-base mb-6 max-w-2xl">
        Welcome to NANO standard, a website dedicated to tracking the evolution and adoption of Nano as a worldwide money standard. 
        To understand Nano's progress, we monitor several key metrics that provide valuable insights into its growth and usage:
      </p>

      <div className="space-y-6 text-left w-full max-w-2xl">
        {/* Price Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-2">💰 Price Across Major World Currencies</h3>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li><span className="font-medium">Why It Matters:</span> Price serves as a reflection of market confidence and adoption.</li>
            <li><span className="font-medium">What I Expect:</span> As Nano gains wider exposure and adoption, its price is likely to appreciate relative to fiat currencies and precious metals, signaling increased demand and utility.</li>
          </ul>
        </div>

        {/* Volume Metrics */}
        <div>
          <h3 className="text-lg font-semibold mb-2">📊 Total Volume Transmitted (in raw Nano units and fiat)</h3>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li><span className="font-medium">Why It Matters:</span> Increasing transaction volumes indicate growing adoption for transferring value.</li>
            <li><span className="font-medium">What I Expect:</span> Both absolute transaction volume (in Nano) and equivalent fiat volume will grow over time as more individuals and businesses adopt Nano for financial transactions.</li>
          </ul>
        </div>

        {/* Send Confirmations */}
        <div>
          <h3 className="text-lg font-semibold mb-2">🔄 Send Confirmations Over Time</h3>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li><span className="font-medium">Why It Matters:</span> The number of "send" confirmations reflects the frequency of transactions occurring on the network.</li>
            <li><span className="font-medium">What I Expect:</span> A steady increase in send confirmations suggests that more users are actively transacting value, further validating Nano's usability and network efficiency.</li>
          </ul>
        </div>

        {/* Gini Coefficient */}
        <div>
          <h3 className="text-lg font-semibold mb-2">⚖️ Gini Coefficient of Transaction Volume</h3>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li><span className="font-medium">Why It Matters:</span> The Gini coefficient measures volume distribution within the Nano network. A Gini close to 1 means only a few transactions take up almost all the volumne, possibly meaning Nano is only used for speculative purposes. A Gini close to 0 means the volume is distributed more evenly, meaning Nano is being used for more everyday transactions by lots of people.</li>
            <li><span className="font-medium">What I Expect:</span> Over time, the Gini coefficient should trend closer to 0, indicating broader participation and usage, and Nano fulfilling its role as a currency.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
