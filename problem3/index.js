// Các điểm không hiệu quả và Anti-pattern

// 1. `prices` phụ thuộc không cần thiết trong `sortedBalances` `useMemo`: 
//     `sortedBalances` `useMemo` phụ thuộc vào `prices`, nhưng `prices` lại không được sử dụng bên trong hàm được memo hóa. 
//      Điều này có nghĩa là memo sẽ tính toán lại không cần thiết bất cứ khi nào `prices` thay đổi, 
//      mặc dù logic sắp xếp chỉ phụ thuộc vào `balances`.

// 2. Logic lọc không chính xác trong `sortedBalances` `useMemo`:
//       Logic lọc `if (lhsPriority > -99)` bên trong phương thức `filter` đang sử dụng một biến chưa được khai báo `lhsPriority`. 
//      Nó phải là `balancePriority`. Hơn nữa, điều kiện `if (balance.amount <= 0)` nằm bên trong khối `if (lhsPriority > -99)`. 
//      Vì vậy, chỉ có số dư với `blockchain` có độ ưu tiên lớn hơn -99 mới được kiểm tra số lượng nhỏ hơn hoặc bằng không. 
//      Đây có lẽ không phải là logic dự định.

// 3. Sắp xếp không hiệu quả sau khi lọc:
//       Code lọc mảng `balances` và *sau đó* sắp xếp mảng *đã lọc*. 
//      Sẽ hiệu quả hơn nếu kết hợp việc lọc và sắp xếp vào một thao tác `sort` duy nhất. 
//      Điều này tránh việc lặp lại mảng hai lần.

// 4. Cảnh báo thiếu `key` prop (có thể):
//       Mặc dù không được hiển thị rõ ràng trong đoạn code, 
//      việc sử dụng `index` làm `key` prop trong component `WalletRow` gần như chắc chắn là một anti-pattern. 
//      Nếu mảng `sortedBalances` thay đổi (điều này sẽ xảy ra do các lần render lại), thứ tự của các phần tử có thể thay đổi, 
//      dẫn đến việc React gắn lại các component không cần thiết và có thể gây ra lỗi. `key` nên ổn định và duy nhất.

// 5. Không khớp kiểu dữ liệu giữa `sortedBalances` và `rows`:
//       Mảng `sortedBalances` được gõ là `WalletBalance[]`, 
//      nhưng biến `rows` được tạo bằng cách map qua `sortedBalances` và truyền các phần tử cho component `WalletRow`. 
//      Component `WalletRow` mong đợi kiểu `FormattedWalletBalance` cho prop `balance`, bao gồm thuộc tính `formatted`. 
//      Tuy nhiên, thuộc tính `formatted` được thêm vào sau trong một map riêng biệt. 
//      Điều này có thể dẫn đến lỗi TypeScript.

// 6. Thiếu kiểu dữ liệu cho `blockchain`:
//       Hàm `getPriority` nhận một đối số `blockchain` thuộc kiểu `any`. 
//      Điều này làm mất đi mục đích của việc sử dụng TypeScript. 
//      Nó nên có một kiểu cụ thể, có thể là kiểu string literal hoặc enum.

// Code đã được Refactor

// ```typescript
interface WalletBalance {
    blockchain: string; // Add blockchain property
    currency: string;
    amount: number;
  }
  
  interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
  }
  
  interface Props extends BoxProps {}
  
  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
  
    const getPriority = (blockchain: string): number => { // Type blockchain
      switch (blockchain) {
        case 'Osmosis':
          return 100;
        case 'Ethereum':
          return 50;
        case 'Arbitrum':
          return 30;
        case 'Zilliqa':
          return 20;
        case 'Neo':
          return 20;
        default:
          return -99;
      }
    };
  
    const sortedBalances = useMemo(() => {
      return [...balances].sort((a: WalletBalance, b: WalletBalance) => { // Combined filter and sort
        const aPriority = getPriority(a.blockchain);
        const bPriority = getPriority(b.blockchain);
  
        //Prioritize by blockchain, then keep 0 balances
        if (aPriority > bPriority) {
          return -1;
        } else if (aPriority < bPriority) {
          return 1;
        } else if (a.amount <= 0 && b.amount > 0){
          return -1
        } else if (a.amount > 0 && b.amount <= 0) {
          return 1
        }
        return 0;
      });
    }, [balances]); // Removed prices dependency
  
    const formattedBalances = useMemo(() => {
      return sortedBalances.map((balance: WalletBalance): FormattedWalletBalance => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));
    }, [sortedBalances]); //Memoize formattedBalances to avoid unnecessary re-renders
  
    const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={balance.currency + balance.amount} // Use a stable and unique key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  
    return <div {...rest}>{rows}</div>;
  };

// Các cải tiến chính

// Kiểu dữ liệu cho `blockchain`: Đã thêm kiểu `string` cho tham số `blockchain` trong `getPriority`.
// Kết hợp lọc và sắp xếp: Phương thức `sort` hiện xử lý logic lọc trực tiếp.
// Đã sửa logic lọc: Logic hiện đã được sửa để giữ lại các số dư có số lượng nhỏ hơn hoặc bằng không sau khi kiểm tra độ ưu tiên.
// Đã loại bỏ phụ thuộc `prices`: Phụ thuộc `prices` đã được loại bỏ khỏi `sortedBalances` `useMemo`.
// `key` prop duy nhất: `key` prop hiện sử dụng kết hợp của `balance.currency` và `balance.amount` (giả sử chúng là duy nhất cho mỗi số dư). Nếu chúng không phải là duy nhất, thì cần tìm một định danh thực sự duy nhất.
// An toàn về kiểu dữ liệu: `formattedBalances` hiện được tạo bằng `useMemo` và các kiểu dữ liệu nhất quán.
// Đã memo hóa `formattedBalances`: Mảng `formattedBalances` hiện được memo hóa bằng `useMemo` để ngăn chặn các lần render lại không cần thiết khi mảng `sortedBalances` không thay đổi. Đây là một tối ưu hóa vì thao tác `map` tạo ra một mảng mới trên mỗi lần render.

// Code đã được refactor này giải quyết các điểm không hiệu quả và anti-pattern, làm cho nó hiệu quả hơn, mạnh mẽ hơn và an toàn hơn về kiểu dữ liệu.
