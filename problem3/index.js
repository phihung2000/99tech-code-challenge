// 1. Incorrect Condition in .filter()
//  Issue: Inside sortedBalances, the filtering logic contains a mistake:
// lhsPriority is not defined anywhere, leading to a ReferenceError.
// Likely intended to use balancePriority instead.

const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {  // lhsPriority is undefined here
  if (balance.amount <= 0) {
    return true;
  }
}
return false;
//fix 
if (balancePriority > -99 && balance.amount <= 0) {
  return true;
}
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 2.Inefficient Sorting in useMemo()
// Issue: Sorting is expensive, and calling getPriority() multiple times per comparison increases complexity.

// Fix:
// Use .map() to precompute priorities and then sort.

const sortedBalances = useMemo(() => {
  return balances
    .map((balance) => ({
      ...balance,
      priority: getPriority(balance.blockchain),
    }))
    .filter(({ priority, amount }) => priority > -99 && amount <= 0)
    .sort((lhs, rhs) => rhs.priority - lhs.priority);
}, [balances]);

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 3.formattedBalances is Unnecessary
// Issue: formattedBalances is redundant because:

// It duplicates data from sortedBalances.
// It doesn't optimize rendering.
// Fix:
// Instead of creating a new array, modify sortedBalances directly:
const sortedBalances = useMemo(() => {
  return balances
    .map((balance) => ({
      ...balance,
      priority: getPriority(balance.blockchain),
      formatted: balance.amount.toFixed(),
    }))
    .filter(({ priority, amount }) => priority > -99 && amount <= 0)
    .sort((lhs, rhs) => rhs.priority - lhs.priority);
}, [balances]);
// Now sortedBalances already includes formatted, eliminating formattedBalances.

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 4. Incorrect Type Usage in rows
// Issue:rows incorrectly assumes sortedBalances contains FormattedWalletBalance, but it actually contains WalletBalance.
// TypeScript won't infer formatted correctly unless explicitly declared.
// Fix:
// Since we already added formatted inside useMemo(), we can correctly type it as FormattedWalletBalance:
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
const rows = sortedBalances.map((balance, index) => {
  const usdValue = prices[balance.currency] * balance.amount;
  return (
    <WalletRow 
      className={classes.row}
      key={index}
      amount={balance.amount}
      usdValue={usdValue}
      formattedAmount={balance.formatted}
    />
  );
});
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 5. Using index as key in .map()
// Issue: key={index} React re-renders inefficiently when items shift in an array.Instead, use a stable identifier, such as balance.currency.
// Fix:
// key={balance.currency}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// 6. useMemo() Dependencies Include prices Unnecessarily
// Issue: The prices dependency in: [balances, prices]);causes sortedBalances to recompute unnecessarily every time prices change, even though it's unrelated.

// Fix:
// Remove prices:[balances]);

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Refactored Version
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  priority: number;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
    const priorityMap: Record<string, number> = {
      Osmosis: 100,
      Ethereum: 50,
      Arbitrum: 30,
      Zilliqa: 20,
      Neo: 20,
    };
    return priorityMap[blockchain] ?? -99;
  };

  const sortedBalances = useMemo(() => {
    return balances
      .map((balance) => ({
        ...balance,
        priority: getPriority(balance.blockchain),
        formatted: balance.amount.toFixed(),
      }))
      .filter(({ priority, amount }) => priority > -99 && amount <= 0)
      .sort((lhs, rhs) => rhs.priority - lhs.priority);
  }, [balances]);

  return (
    <div {...rest}>
      {sortedBalances.map((balance) => (
        <WalletRow 
          className={classes.row}
          key={balance.currency}
          amount={balance.amount}
          usdValue={prices[balance.currency] * balance.amount}
          formattedAmount={balance.formatted}
        />
      ))}
    </div>
  );
};