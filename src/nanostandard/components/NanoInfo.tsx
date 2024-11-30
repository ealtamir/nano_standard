export default function NanoInfo() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 px-4 text-center">
      <div className="flex items-center space-x-4">
        <img 
          src="/nano-logo-blue-dark-blue.png" 
          alt="Nano Logo" 
          style={{ height: '50px' }}
        />
      </div>
      <div className="max-w-4xl">
        <p className="text-lg leading-relaxed">
          Nano represents a paradigm shift in cryptocurrency, offering instant, feeless, and 
          environmentally-friendly transactions. Unlike traditional blockchain networks, Nano's 
          block-lattice architecture allows each account to have its own blockchain, enabling 
          unprecedented scalability. With no miners, no fees, and minimal energy consumption, 
          Nano delivers on the original promise of digital cash: a decentralized currency that's 
          actually practical for everyday transactions.
        </p>
      </div>
    </div>
  )
}
