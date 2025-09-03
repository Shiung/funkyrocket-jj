export const getRandomNum = (min: number, max: number) => {
  return (Math.floor(Math.random() * max + 1) - 1) + min // 不含最大值
}
