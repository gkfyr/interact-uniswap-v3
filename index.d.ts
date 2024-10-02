declare module "@thanpolas/univ3prices" {
  interface Price {
    getPrice: (tick: number) => number;
    // 필요한 함수들에 대한 타입 정의 추가
  }

  const univ3prices: Price;
  export default univ3prices;
}
