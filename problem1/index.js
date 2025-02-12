var sum_to_n_a = function(n) {
    // method 1: Uses a for loop to iterate from 1 to n and incrementally add the values to sum
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};

var sum_to_n_b = function(n) {
    // method 2: Uses recursion, calling itself with n - 1 until n === 1
    if (n === 1) return 1;
    return n + sum_to_n_b(n - 1);
};

var sum_to_n_c = function(n) {
    // method 3: Uses a mathematical formula (n * (n + 1)) / 2 to compute the sum in a single operation, making it the most efficient method
    return (n * (n + 1)) / 2;
};