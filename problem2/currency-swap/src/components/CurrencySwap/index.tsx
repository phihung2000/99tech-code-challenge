/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const API_URL = "https://interview.switcheo.com/prices.json";

interface Token {
  symbol: string;
  price?: number;
}

const CurrencySwap = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromCurrency, setFromCurrency] = useState<Token | null>(null);
  const [toCurrency, setToCurrency] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("");

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      const availableTokens = response.data
        .map((token: any) => ({
          symbol: token.currency,
          price: token.price,
        }))
        .filter((token: Token) => token.price);

      setTokens(availableTokens);
    });
  }, []);

  const handleSwap = () => {
    if (!fromCurrency || !toCurrency || !amount) return;
    const fromPrice = fromCurrency.price || 1;
    const toPrice = toCurrency.price || 1;
    const convertedAmount = (parseFloat(amount) * fromPrice) / toPrice;
    alert(`You will receive ${convertedAmount.toFixed(4)} ${toCurrency.symbol}`);
  };

  return (
    <div className="swap-container">
      <h2>Currency Swap</h2>
      <div className="form-group">
        <label>From</label>
        <Select
          options={tokens.map((t) => ({ value: t, label: t.symbol }))}
          onChange={(option) => setFromCurrency(option?.value || null)}
          className="select-tokens"
          classNamePrefix= "select-tokens"
        />
      </div>
      <div className="form-group">
        <label>To</label>
        <Select
          options={tokens.map((t) => ({ value: t, label: t.symbol }))}
          onChange={(option) => setToCurrency(option?.value || null)}
          className="select-tokens"
          classNamePrefix="select-tokens"
        />
      </div>
      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button onClick={handleSwap} disabled={!fromCurrency || !toCurrency || !amount}>
        Swap
      </button>
    </div>
  );
};

export default CurrencySwap;
