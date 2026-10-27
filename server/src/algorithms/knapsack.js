export function knapsack(items, capacity) {
  if (!Number.isInteger(capacity) || capacity < 0) throw new Error('Capacity must be a non-negative integer');
  if (!Array.isArray(items) || items.some((item) => !Number.isInteger(item.time) || item.time < 0 || typeof item.value !== 'number' || item.value < 0)) throw new Error('Items require non-negative time and value');
  const dp = Array(capacity + 1).fill(0), chosen = Array.from({ length: capacity + 1 }, () => []);
  for (const item of items) for (let time = capacity; time >= item.time; time--) if (dp[time - item.time] + item.value > dp[time]) { dp[time] = dp[time - item.time] + item.value; chosen[time] = [...chosen[time - item.time], item]; }
  const selected = chosen[capacity]; const totalTime = selected.reduce((sum, item) => sum + item.time, 0);
  return { selected, totalTime, totalValue: dp[capacity], unusedTime: capacity - totalTime };
}
